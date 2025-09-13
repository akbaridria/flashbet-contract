module flashbet::flashbet_core {
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    
    use flashbet::bet_manager;
    use flashbet::liquidity_manager;
    use flashbet::errors::get_error_code;
    use flashbet::events;
    use flashbet::price_feed;
    use flashbet::usdc;

    const PROTOCOL_FEE: u64 = 100;
    const RESOLVER_FEE: u64 = 100;
    const BASIS_POINTS: u64 = 10000;
    const LIQUIDITY_LOCK_RATIO: u64 = 7500;
    const LIQUIDITY_LOCK_THRESHOLD: u64 = 8000;
    const MAX_BET_AMOUNT: u64 = 1_000_000_000;

    struct Flashbet has key {
        pyth_btc_price_id: address,
        is_paused: bool,
    }
    
    fun init_module(account: &signer) {
        bet_manager::init_bet_manager(account);
        liquidity_manager::init_liquidity_manager(account);
    }

    fun check_and_update_pause_state() acquires Flashbet {
        let flashbet = borrow_global_mut<Flashbet>(@flashbet);
        let total = liquidity_manager::get_total_liquidity();
        let locked = liquidity_manager::get_locked_liquidity();
        let utilization_rate = if (total == 0) 0 else locked * BASIS_POINTS / total;

        let changed = false;
        if (utilization_rate >= LIQUIDITY_LOCK_THRESHOLD && !flashbet.is_paused) {
            flashbet.is_paused = true;
            changed = true;
        } else if (utilization_rate < LIQUIDITY_LOCK_THRESHOLD && flashbet.is_paused) {
            flashbet.is_paused = false;
            changed = true;
        };

        if (changed) {
            if (flashbet.is_paused) {
                events::emit_market_paused_event(timestamp::now_seconds());
            } else {
                events::emit_market_unpaused_event(timestamp::now_seconds());
            }
        }
    }

    public entry fun place_bet(
        user: &signer,
        amount: u64,
        duration: u64,
        is_long: bool,
        slippage_price: u128,
        update_data: vector<vector<u8>>
    ) acquires Flashbet {
        let flashbet = borrow_global<Flashbet>(@flashbet);

        // validation
        assert!(flashbet.is_paused == false, get_error_code(9));
        assert!(duration >= 120 && duration <= 600, get_error_code(10));
        assert!(amount <= MAX_BET_AMOUNT, get_error_code(11));

        let user_address = signer::address_of(user);

        // update price feed
        let (current_price,_, res_neg) = price_feed::update_and_return(user, update_data, flashbet.pyth_btc_price_id);
        assert!(res_neg, get_error_code(12));
        
        // check slippage in entry price
        if (is_long) {
            assert!(current_price > slippage_price, get_error_code(13));
        } else {
            assert!(current_price < slippage_price, get_error_code(13));
        };

        // transfer coin
        coin::transfer<usdc::USDC>(user, @flashbet, amount);
        let lock_amount = (amount * LIQUIDITY_LOCK_RATIO) / BASIS_POINTS;
        liquidity_manager::lock_liquidity(lock_amount);

        // place bet
        bet_manager::place_bet(user_address, amount, duration, is_long, current_price);
        
        // check and update pause state
        check_and_update_pause_state();
    }
}