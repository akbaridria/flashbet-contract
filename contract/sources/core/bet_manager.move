module flashbet::bet_manager {
    friend flashbet::flashbet_core;

    use aptos_framework::timestamp;
    use aptos_framework::option;
    use aptos_framework::vector;
    use aptos_framework::table;

    use flashbet::events;
    use flashbet::types;
    use flashbet::errors::get_error_code;

    struct BetManager has key {
        next_bet_id: u64,
        bets: table::Table<u64, types::Bet>,
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
            types::new_bet(
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

        assert!(!types::is_resolved(bet_ref), get_error_code(2));
        let (_,_,b_amount,b_entry_price,_,b_expiry_time,b_is_long,_,_,_) = types::get_bet_detail(bet_ref);
        assert!(timestamp::now_seconds() >= b_expiry_time, get_error_code(3));
        
        if (timestamp::now_seconds() >= b_expiry_time + 60) {
            // early return if bet expired more than 60 seconds ago
            return (false, 0, true);
        };

        let won;
        if (b_is_long) {
            won = exit_price > b_entry_price;
        } else {
            won = exit_price < b_entry_price;
        };

        let payout;
        if (won) {
            payout = (b_amount * PAYOUT_MULTIPLIER) / BASIS_POINTS;
        } else {
            payout = 0;
        };

        types::set_bet_status(bet_ref, 1);
        types::set_bet_won(bet_ref, won);
        types::set_bet_resolver(bet_ref, resolver);

        events::emit_bet_resolved_event(bet_id, resolver, won, payout);

        (won, payout, false)
    }

    public(friend) fun cancel_bet(bet_id: u64) acquires BetManager {

        let bet_manager = borrow_global_mut<BetManager>(@flashbet);
        let bet_ref = bet_manager.bets.borrow_mut(bet_id);

        assert!(types::is_pending(bet_ref), get_error_code(4));

        types::set_bet_status(bet_ref, 2);

        events::emit_bet_cancelled_event(bet_id);
    }

    public(friend) fun get_bet(bet_id: u64): option::Option<types::Bet> acquires BetManager {
        let bet_manager = borrow_global<BetManager>(@flashbet);
        if (bet_manager.bets.contains(bet_id)) {
            option::some(*bet_manager.bets.borrow(bet_id))
        } else {
            option::none()
        }
    }

    public(friend) fun can_resolve_bet(bet_id: u64): bool acquires BetManager {
        let bet_manager = borrow_global<BetManager>(@flashbet);
        if (!bet_manager.bets.contains(bet_id)) return false;
        let bet = bet_manager.bets.borrow(bet_id);
        let (_,b_user,_,_,_,b_expiry_time,_,_,_,_) = types::get_bet_detail(bet);
        types::is_pending(bet) && timestamp::now_seconds() >= b_expiry_time && b_user != @0x0
    }

    public(friend) fun get_user_bets(user: address): option::Option<vector<u64>> acquires BetManager {
        let bet_manager = borrow_global<BetManager>(@flashbet);
        if (bet_manager.user_bets.contains(user)) {
            option::some(*bet_manager.user_bets.borrow(user))
        } else {
            option::none()
        }
    }
}