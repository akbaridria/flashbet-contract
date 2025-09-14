module flashbet::liquidity_manager {
    use aptos_framework::option;

    use flashbet::reward_distributor::{Self, ProviderBalance};
    use flashbet::errors::get_error_code;

    struct LiquidityPool has key, copy {
        total_liquidity: u64,
        locked_liquidity: u64,
    }

    public(package) fun init_liquidity_manager(account: &signer) {
        reward_distributor::initialize(account);
        move_to(account, LiquidityPool {
            total_liquidity: 0,
            locked_liquidity: 0,
        });
    }

    public(package) fun add_liquidity(provider: address, amount: u64) acquires LiquidityPool {
        let pool = borrow_global_mut<LiquidityPool>(@flashbet);
        pool.total_liquidity += amount;
        reward_distributor::add_stake(provider, amount);
    }

    public(package) fun remove_liquidity(provider: address, amount: u64) acquires LiquidityPool {
        let pool = borrow_global_mut<LiquidityPool>(@flashbet);
        assert!(pool.total_liquidity - pool.locked_liquidity >= amount, get_error_code(8));
        pool.total_liquidity -= amount;
        reward_distributor::remove_stake(provider, amount);
    }

    public(package) fun lock_liquidity(amount: u64) acquires LiquidityPool {
        let pool = borrow_global_mut<LiquidityPool>(@flashbet);
        assert!(pool.total_liquidity - pool.locked_liquidity >= amount, get_error_code(8));
        pool.locked_liquidity += amount;
    }

    public(package) fun unlock_liquidity(amount: u64) acquires LiquidityPool {
        let pool = borrow_global_mut<LiquidityPool>(@flashbet);
        assert!(pool.locked_liquidity >= amount, get_error_code(8));
        pool.locked_liquidity -= amount;
    }

    public(package) fun distribute_pnl(pnl_positive: u128, pnl_negative: u128) acquires LiquidityPool {
        let pool = borrow_global_mut<LiquidityPool>(@flashbet);
        
        reward_distributor::distribute_pnl(pnl_positive, pnl_negative);

        if (pnl_positive >= pnl_negative) {
            let net_positive = pnl_positive - pnl_negative;
            pool.total_liquidity += net_positive as u64;
        } else {
            let net_negative = (pnl_negative - pnl_positive) as u64;
            if (pool.total_liquidity >= net_negative) {
                pool.total_liquidity -= net_negative;
            } else {
                pool.total_liquidity = 0;
            };
        };
    }

    #[view]
    public(package) fun get_total_liquidity(): u64 acquires LiquidityPool {
        let pool = borrow_global<LiquidityPool>(@flashbet);
        pool.total_liquidity
    }

    #[view]
    public(package) fun get_locked_liquidity(): u64 acquires LiquidityPool {
        let pool = borrow_global<LiquidityPool>(@flashbet);
        pool.locked_liquidity
    }

    #[view]
    public(package) fun get_provider_liquidity(provider: address): option::Option<ProviderBalance> {
        let info = reward_distributor::get_provider_info(provider);
        option::some(info)
    }
}