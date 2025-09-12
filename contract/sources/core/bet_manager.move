module flashbet::bet_manager {
    friend flashbet::flashbet_core;

    use aptos_framework::timestamp;
    use aptos_framework::option;
    use aptos_framework::vector;
    use aptos_framework::table;

    use flashbet::events;
    use flashbet::errors::get_error_code;

    enum Status has drop, copy, store {
        Pending,
        Resolved,
        Cancelled
    }

    struct Bet has key, drop, copy, store {
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

    struct BetManager has key {
        next_bet_id: u64,
        bets: table::Table<u64, Bet>,
        user_bets: table::Table<address, vector<u64>>,
    }

    const PAYOUT_MULTIPLIER: u64 = 17_500;
    const BASIS_POINTS: u64 = 10_000;

    public(friend) fun init_bet_manager(account: &signer) {
        move_to(account, BetManager {
            next_bet_id: 1,
            bets: table::new(),
            user_bets: table::new(),
        });
    }

    fun new_bet(
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

    public(friend) fun place_bet(
        user: address,
        amount: u64,
        duration: u64,
        is_long: bool,
        entry_price: u64,
    ): u64 acquires BetManager {
        let bet_manager = borrow_global_mut<BetManager>(@flashbet);
        let bet_id = bet_manager.next_bet_id;
        bet_manager.next_bet_id = bet_id + 1;

         bet_manager.bets.add(
            bet_id,
            new_bet(
                bet_id,
                user,
                amount,
                entry_price,
                duration,
                is_long
            )
        );

        let user_bets = bet_manager.user_bets.borrow_mut_with_default(user, vector::empty<u64>());
        user_bets.push_back(bet_id);

        events::emit_placed_bet_event(bet_id, user, amount, timestamp::now_seconds() + duration);

        bet_id
    }

    public(friend) fun resolve_bet(
        bet_id: u64,
        exit_price: u64,
        resolver: address,
    ): (bool, u64, bool) acquires BetManager {

        let bet_manager = borrow_global_mut<BetManager>(@flashbet);
        let bet_ref = bet_manager.bets.borrow_mut(bet_id);

        assert!(bet_ref.status == Status::Resolved, get_error_code(2));

        assert!(timestamp::now_seconds() >= bet_ref.expiry_time, get_error_code(3));

        if (timestamp::now_seconds() >= bet_ref.expiry_time + 60) {
            // early return if bet expired more than 60 seconds ago
            return (false, 0, true);
        };

        let won;
        if (bet_ref.is_long) {
            won = exit_price > bet_ref.entry_price;
        } else {
            won = exit_price < bet_ref.entry_price;
        };

        let payout;
        if (won) {
            payout = (bet_ref.amount * PAYOUT_MULTIPLIER) / BASIS_POINTS;
        } else {
            payout = 0;
        };

        bet_ref.status = Status::Resolved;
        bet_ref.won = won;
        bet_ref.resolver = resolver;

        events::emit_bet_resolved_event(bet_id, resolver, won, payout);

        (won, payout, false)
    }

    public(friend) fun cancel_bet(bet_id: u64) acquires BetManager {

        let bet_manager = borrow_global_mut<BetManager>(@flashbet);
        let bet_ref = bet_manager.bets.borrow_mut(bet_id);

        assert!(bet_ref.status == Status::Pending, get_error_code(4));

        bet_ref.status = Status::Cancelled;

        events::emit_bet_cancelled_event(bet_id);
    }

    #[view]
    public(friend) fun get_bet(bet_id: u64): option::Option<Bet> acquires BetManager {
        let bet_manager = borrow_global<BetManager>(@flashbet);
        if (bet_manager.bets.contains(bet_id)) {
            option::some(*bet_manager.bets.borrow(bet_id))
        } else {
            option::none()
        }
    }

    #[view]
    public(friend) fun can_resolve_bet(bet_id: u64): bool acquires BetManager {
        let bet_manager = borrow_global<BetManager>(@flashbet);
        if (!bet_manager.bets.contains(bet_id)) return false;
        let bet = bet_manager.bets.borrow(bet_id);
        bet.status == Status::Pending && timestamp::now_seconds() >= bet.expiry_time && bet.user != @0x0
    }

    #[view]
    public(friend) fun get_user_bets(user: address): option::Option<vector<u64>> acquires BetManager {
        let bet_manager = borrow_global<BetManager>(@flashbet);
        if (bet_manager.user_bets.contains(user)) {
            option::some(*bet_manager.user_bets.borrow(user))
        } else {
            option::none()
        }
    }
}