module flashbet::reward_distributor {
    friend flashbet::liquidity_manager;

    use aptos_framework::table::{ Self, Table};
    use aptos_framework::timestamp;

    use flashbet::events;
    use flashbet::errors::get_error_code;

    const PRECISION: u128 = 1000000000000000000; // 1e18

    struct ProviderInfo has store, drop {
        stake: u64,
        reward_debt_positive: u128,
        reward_debt_negative: u128,
        last_update_time: u64,
    }

    struct ProviderBalance has drop {
        stake: u64,
        pending_rewards_positive: u128,
        pending_rewards_negative: u128,
        effective_balance: u64,
    }
    
    struct PoolInfo has store, copy {
        total_staked: u64,
        acc_reward_per_share_positive: u128,
        acc_reward_per_share_negative: u128,
        last_reward_time: u64,
        total_pnl_positive: u128,
        total_pnl_negative: u128,
    }

    struct DistributionPool has key {
        providers: Table<address, ProviderInfo>,
        pool: PoolInfo,
    }

    public(friend) fun initialize(account: &signer) {
        let pool_info = PoolInfo {
            total_staked: 0,
            acc_reward_per_share_positive: 0,
            acc_reward_per_share_negative: 0,
            last_reward_time: timestamp::now_seconds(),
            total_pnl_positive: 0,
            total_pnl_negative: 0,
        };
        
        let distribution_pool = DistributionPool {
            providers: table::new(),
            pool: pool_info,
        };
        
        move_to(account, distribution_pool);
    }

    fun update_pool(pool: &mut PoolInfo) {
        let current_time = timestamp::now_seconds();
        if (current_time <= pool.last_reward_time) return;
        pool.last_reward_time = current_time;
    }

    public(friend) fun add_stake(provider: address, amount: u64) acquires DistributionPool {
        let pool_ref = borrow_global_mut<DistributionPool>(@flashbet);
        update_pool(&mut pool_ref.pool);
        
        if (!pool_ref.providers.contains(provider)) {
            let new_provider = ProviderInfo {
                stake: 0,
                reward_debt_positive: 0,
                reward_debt_negative: 0,
                last_update_time: timestamp::now_seconds(),
            };
            pool_ref.providers.add(provider, new_provider);
        };
        
        let provider_info = pool_ref.providers.borrow_mut(provider);
        
        provider_info.stake += amount;
        
        // Calculate reward debt adjustment
        let debt_adjustment_pos = (pool_ref.pool.acc_reward_per_share_positive * (amount as u128)) / PRECISION;
        let debt_adjustment_neg = (pool_ref.pool.acc_reward_per_share_negative * (amount as u128)) / PRECISION;
        
        provider_info.reward_debt_positive += debt_adjustment_pos;
        provider_info.reward_debt_negative += debt_adjustment_neg;
        provider_info.last_update_time = timestamp::now_seconds();
        
        pool_ref.pool.total_staked += amount;
        
        events::emit_liquidity_added_event(provider, amount);
    }

    fun get_pending_rewards_internal(pool_ref: &DistributionPool, provider: address): (u128, u128) {
        if (!pool_ref.providers.contains(provider)) return (0, 0);
        
        let provider_info = pool_ref.providers.borrow(provider);
        if (provider_info.stake == 0) return (0, 0);
        
        let total_rewards_positive = ((provider_info.stake as u128) * pool_ref.pool.acc_reward_per_share_positive) / PRECISION;
        let total_rewards_negative = ((provider_info.stake as u128) * pool_ref.pool.acc_reward_per_share_negative) / PRECISION;
        
        let pending_positive = if (total_rewards_positive >= provider_info.reward_debt_positive) {
            total_rewards_positive - provider_info.reward_debt_positive
        } else {
            0
        };
        
        let pending_negative = if (total_rewards_negative >= provider_info.reward_debt_negative) {
            total_rewards_negative - provider_info.reward_debt_negative
        } else {
            0
        };
        
        (pending_positive, pending_negative)
    }

    fun get_effective_balance_internal(pool_ref: &DistributionPool, provider: address): u64 {
        if (!pool_ref.providers.contains(provider)) return 0;
        
        let provider_info = pool_ref.providers.borrow(provider);
        if (provider_info.stake == 0) return 0;
        
        let (pending_positive, pending_negative) = get_pending_rewards_internal(pool_ref, provider);
        
        let stake_in_precision = (provider_info.stake as u128) * PRECISION;
        let effective_balance = stake_in_precision + pending_positive;
        
        if (effective_balance >= pending_negative) {
            ((effective_balance - pending_negative) / PRECISION) as u64
        } else {
            0
        }
    }

    public fun remove_stake(provider: address, amount: u64): u64 acquires DistributionPool {
        let pool_ref = borrow_global_mut<DistributionPool>(@flashbet);
        update_pool(&mut pool_ref.pool);
        
        assert!(pool_ref.providers.contains(provider), get_error_code(5));
        
        // Get provider info values before borrowing mutably
        let provider_stake = pool_ref.providers.borrow(provider).stake;
        let provider_reward_debt_pos = pool_ref.providers.borrow(provider).reward_debt_positive;
        let provider_reward_debt_neg = pool_ref.providers.borrow(provider).reward_debt_negative;
        
        // Calculate pending rewards
        let total_rewards_positive = ((provider_stake as u128) * pool_ref.pool.acc_reward_per_share_positive) / PRECISION;
        let total_rewards_negative = ((provider_stake as u128) * pool_ref.pool.acc_reward_per_share_negative) / PRECISION;
        
        let pending_rewards_pos = if (total_rewards_positive >= provider_reward_debt_pos) {
            total_rewards_positive - provider_reward_debt_pos
        } else {
            0
        };
        
        let pending_rewards_neg = if (total_rewards_negative >= provider_reward_debt_neg) {
            total_rewards_negative - provider_reward_debt_neg
        } else {
            0
        };
        
        // Calculate effective balance
        let stake_in_precision = (provider_stake as u128) * PRECISION;
        let effective_balance_u128 = stake_in_precision + pending_rewards_pos;
        let effective_balance = if (effective_balance_u128 >= pending_rewards_neg) {
            ((effective_balance_u128 - pending_rewards_neg) / PRECISION) as u64
        } else {
            0
        };
        
        assert!(amount <= effective_balance, get_error_code(6));
        
        let stake_to_remove = if (pending_rewards_pos >= pending_rewards_neg) {
            let net_positive_rewards = pending_rewards_pos - pending_rewards_neg;
            let net_positive_u64 = (net_positive_rewards / PRECISION) as u64;
            
            if (amount <= net_positive_u64) {
                0
            } else {
                amount - net_positive_u64
            }
        } else {
            amount
        };
        
        // Now mutably borrow provider info
        let provider_info = pool_ref.providers.borrow_mut(provider);
        
        if (stake_to_remove > 0) {
            assert!(provider_info.stake >= stake_to_remove, get_error_code(7));
            provider_info.stake -= stake_to_remove;
            pool_ref.pool.total_staked -= stake_to_remove;
            
            // Adjust reward debt
            let debt_adjustment_pos = (pool_ref.pool.acc_reward_per_share_positive * (stake_to_remove as u128)) / PRECISION;
            let debt_adjustment_neg = (pool_ref.pool.acc_reward_per_share_negative * (stake_to_remove as u128)) / PRECISION;
            
            if (provider_info.reward_debt_positive >= debt_adjustment_pos) {
                provider_info.reward_debt_positive -= debt_adjustment_pos;
            } else {
                provider_info.reward_debt_positive = 0;
            };
            
            if (provider_info.reward_debt_negative >= debt_adjustment_neg) {
                provider_info.reward_debt_negative -= debt_adjustment_neg;
            } else {
                provider_info.reward_debt_negative = 0;
            };
        };
        
        provider_info.last_update_time = timestamp::now_seconds();
        
        let remaining_stake = provider_info.stake;
        
        if (provider_info.stake == 0) {
            pool_ref.providers.remove(provider);
        };
        
        events::emit_liquidity_removed_event(provider, amount, remaining_stake);
        
        amount
    }

    public(friend) fun distribute_pnl(pnl_positive: u128, pnl_negative: u128) acquires DistributionPool {
        let pool_ref = borrow_global_mut<DistributionPool>(@flashbet);

        if (pool_ref.pool.total_staked == 0) return;
        
        update_pool(&mut pool_ref.pool);
        
        pool_ref.pool.total_pnl_positive += pnl_positive;
        pool_ref.pool.total_pnl_negative += pnl_negative;
        
        if (pnl_positive > 0) {
            let reward_per_share = (pnl_positive * PRECISION) / (pool_ref.pool.total_staked as u128);
            pool_ref.pool.acc_reward_per_share_positive += reward_per_share;
        };
        
        if (pnl_negative > 0) {
            let penalty_per_share = (pnl_negative * PRECISION) / (pool_ref.pool.total_staked as u128);
            pool_ref.pool.acc_reward_per_share_negative += penalty_per_share;
        };
        
        events::emit_rewards_distributed_event(
            pnl_positive,
            pnl_negative,
            pool_ref.pool.acc_reward_per_share_positive,
            pool_ref.pool.acc_reward_per_share_negative,
        );
    }

    #[view]
    public fun get_provider_info(provider: address): ProviderBalance acquires DistributionPool {
        let pool_ref = borrow_global<DistributionPool>(@flashbet);
        
        if (!pool_ref.providers.contains(provider)) {
            return ProviderBalance {
                stake: 0,
                pending_rewards_positive: 0,
                pending_rewards_negative: 0,
                effective_balance: 0
            };
        };
        
        let provider_info = pool_ref.providers.borrow(provider);
        let (pending_positive, pending_negative) = get_pending_rewards_internal(pool_ref, provider);
        let effective_balance = get_effective_balance_internal(pool_ref, provider);

        ProviderBalance {
            stake: provider_info.stake,
            pending_rewards_positive: pending_positive,
            pending_rewards_negative: pending_negative,
            effective_balance
        }
    }
    
    #[view]
    public fun get_pool_info(): PoolInfo acquires DistributionPool {
        let pool_ref = borrow_global<DistributionPool>(@flashbet);
        pool_ref.pool
    }
}