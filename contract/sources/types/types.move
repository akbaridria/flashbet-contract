module flashbet::types {
    use aptos_framework::timestamp;

    enum Status has store {
        Pending,
        Resolved,
        Cancelled
    }

    struct Bet has key, store {
        id: u64,
        user: address,
        amount: u64,
        entry_price: u64,
        entry_time: u64,
        expiry_time: u64,
        is_long: bool,
        won: bool,
        resolver: address,
        status: Status,
    }

    public fun new_bet(
        id: u64,
        user: address,
        amount: u64,
        entry_price: u64,
        duration: u64,
        is_long: bool
    ): Bet {
        Bet {
            id,
            user,
            amount,
            entry_price,
            entry_time: timestamp::now_seconds(),
            expiry_time: timestamp::now_seconds() + duration,
            is_long,
            won: false,
            resolver: @0x0,
            status: Status::Pending,
        }
    }

    public fun get_bet_detail(bet: &Bet): (u64, address, u64, u64, u64, u64, bool, bool, address, Status) {
        (
            bet.id,
            bet.user,
            bet.amount,
            bet.entry_price,
            bet.entry_time,
            bet.expiry_time,
            bet.is_long,
            bet.won,
            bet.resolver,
            bet.status
        )
    }

    public fun set_bet_won(bet: &mut Bet, won: bool) {
        bet.won = won;
    }

    public fun set_bet_resolver(bet: &mut Bet, resolver: address) {
        bet.resolver = resolver;
    }

    public fun is_pending(bet: &Bet): bool {
        if (bet.status == Status::Pending) {
            true
        } else {
            false
        }
    }
    public fun is_resolved(bet: &Bet): bool {
        if (bet.status == Status::Resolved) {
            true
        } else {
            false
        }
    }
    public fun is_cancelled(bet: &Bet): bool {
        if (bet.status == Status::Cancelled) {
            true
        } else {
            false
        }
    }

    public fun set_bet_status(bet: &mut Bet, status: u8) {
        if (status == 0) {
            bet.status = Status::Pending;
        } else if (status == 1) {
            bet.status = Status::Resolved;
        } else if (status == 2) {
            bet.status = Status::Cancelled;
        }
    }
}