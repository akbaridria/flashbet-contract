module flashbet::events {
    use aptos_framework::event;

    // BET EVENTS

    #[event]
    struct PlacedBetEvent has drop, store {
        bet_id: u64,
        user: address,
        amount: u64,
        expiry_time: u64,
    }

    public(package) fun emit_placed_bet_event(bet_id: u64, user: address, amount: u64, expiry_time: u64) {
        event::emit(PlacedBetEvent {
            bet_id,
            user,
            amount,
            expiry_time,
        });
    }

    #[event]
    struct BetResolvedEvent has drop, store {
        bet_id: u64,
        resolver: address,
        won: bool,
        payout: u64,
    }

    public(package) fun emit_bet_resolved_event(bet_id: u64, resolver: address, won: bool, payout: u64) {
        event::emit(BetResolvedEvent {
            bet_id,
            resolver,
            won,
            payout,
        });
    }

    #[event]
    struct BetCancelledEvent has drop, store {
        bet_id: u64,
    }


    public(package) fun emit_bet_cancelled_event(bet_id: u64) {
        event::emit(BetCancelledEvent { bet_id });
    }

    // LIQUIDITY EVENTS
    #[event]
    struct LiquidityAdded has drop, store {
        provider: address,
        amount: u64,
    }
    
    public(package) fun emit_liquidity_added_event(provider: address, amount: u64) {
        event::emit(LiquidityAdded {
            provider,
            amount,
        });
    }

    #[event]
    struct LiquidityRemoved has drop, store {
        provider: address,
        amount: u64,
        remaining_stake: u64,
    }

    public(package) fun emit_liquidity_removed_event(provider: address, amount: u64, remaining_stake: u64) {
        event::emit(LiquidityRemoved {
            provider,
            amount,
            remaining_stake,
        });
    }
    
    #[event]
    struct RewardsDistributed has drop, store {
        pnl_positive: u128,
        pnl_negative: u128,
        acc_reward_per_share_positive: u128,
        acc_reward_per_share_negative: u128,
    }  

    public(package) fun emit_rewards_distributed_event(
        pnl_positive: u128,
        pnl_negative: u128,
        acc_reward_per_share_positive: u128,
        acc_reward_per_share_negative: u128,
    ) {
        event::emit(RewardsDistributed {
            pnl_positive,
            pnl_negative,
            acc_reward_per_share_positive,
            acc_reward_per_share_negative,
        });
    }

    // FLASHBET CORE

    #[event]
    struct MarketPausedEvent has drop, store {
        timestamp: u64,
    }

    public(package) fun emit_market_paused_event(timestamp: u64) {
        event::emit(MarketPausedEvent { timestamp });
    }

    #[event]
    struct MarketUnpausedEvent has drop, store {
        timestamp: u64,
    }

    public(package) fun emit_market_unpaused_event(timestamp: u64) {
        event::emit(MarketUnpausedEvent { timestamp });
    }
    
}