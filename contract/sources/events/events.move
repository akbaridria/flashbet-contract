module flashbet::events {
    use aptos_framework::event;

    #[event]
    struct PlacedBetEvent has drop, store {
        bet_id: u64,
        user: address,
        amount: u64,
        expiry_time: u64,
    }

    #[event]
    struct BetResolvedEvent has drop, store {
        bet_id: u64,
        resolver: address,
        won: bool,
        payout: u64,
    }

    #[event]
    struct BetCancelledEvent has drop, store {
        bet_id: u64,
    }

    #[event]
    struct LiquidityAddedEvent has drop, store {
        provider: address,
        amount: u64,
    }

    #[event]
    struct LiquidityRemovedEvent has drop, store {
        provider: address,
        amount: u64,
    }

    public fun emit_placed_bet_event(bet_id: u64, user: address, amount: u64, expiry_time: u64) {
        event::emit(PlacedBetEvent {
            bet_id,
            user,
            amount,
            expiry_time,
        });
    }

    public fun emit_bet_resolved_event(bet_id: u64, resolver: address, won: bool, payout: u64) {
        event::emit(BetResolvedEvent {
            bet_id,
            resolver,
            won,
            payout,
        });
    }

    public fun emit_bet_cancelled_event(bet_id: u64) {
        event::emit(BetCancelledEvent { bet_id });
    }
}