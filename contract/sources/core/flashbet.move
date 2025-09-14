module flashbet::flashbet_core {
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_framework::option;
    
    use flashbet::bet_manager;
    use flashbet::liquidity_manager;
    use flashbet::errors::get_error_code;
    use flashbet::events;
    use flashbet::price_feed;
    use flashbet::usdc;
    use flashbet::vault;
    use flashbet::reward_distributor::ProviderBalance;

    const PROTOCOL_FEE: u64 = 100;
    const RESOLVER_FEE: u64 = 100;
    const BASIS_POINTS: u64 = 10000;
    const LIQUIDITY_LOCK_RATIO: u64 = 7500;
    const LIQUIDITY_LOCK_THRESHOLD: u64 = 8000;
    const MAX_BET_AMOUNT: u64 = 1_000_000_000;

    struct Flashbet has key {
        balance: coin::Coin<usdc::USDC>,
        pyth_btc_price_id: vector<u8>,
        is_paused: bool,
    }

    fun init_module(account: &signer) {
        // currently we are only supporting BTC/USD price feed
        let btc_price_identifier = x"e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
        usdc::init(account);
        price_feed::init_price_feed(account, btc_price_identifier);
        bet_manager::init_bet_manager(account);
        liquidity_manager::init_liquidity_manager(account);

        move_to(account, Flashbet {
            balance: coin::zero<usdc::USDC>(),
            pyth_btc_price_id: btc_price_identifier,
            is_paused: true,
        });
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
        slippage_price: u64,
        update_data: vector<vector<u8>>
    ) acquires Flashbet {
        let flashbet = borrow_global<Flashbet>(@flashbet);

        // validation
        assert!(flashbet.is_paused == false, get_error_code(9));
        assert!(duration >= 120 && duration <= 600, get_error_code(10));
        assert!(amount <= MAX_BET_AMOUNT, get_error_code(11));

        let user_address = signer::address_of(user);

        // update price feed
        let current_price = price_feed::get_price(user, update_data);
        
        // check slippage in entry price
        if (is_long) {
            assert!(current_price > slippage_price, get_error_code(13));
        } else {
            assert!(current_price < slippage_price, get_error_code(13));
        };

        // transfer USDC from user to flashbet
        vault::transfer_to_flashbet(user, amount);

        let lock_amount = (amount * LIQUIDITY_LOCK_RATIO) / BASIS_POINTS;
        liquidity_manager::lock_liquidity(lock_amount);

        // place bet
        bet_manager::place_bet(user_address, amount, duration, is_long, current_price);
        
        // check and update pause state
        check_and_update_pause_state();
    }

    fun cancel_bet(user: &signer, bet_id: u64) acquires Flashbet {
        let bet_opt = bet_manager::get_bet(bet_id);
        assert!(option::is_some(&bet_opt), get_error_code(14));

        let user_address = signer::address_of(user);
        let bet_ref = option::borrow(&bet_opt);
        let (bet_id,bet_user,bet_amount,_,_,_,_,_,_,_) = bet_manager::unpack_bet(bet_ref);

        // cancel bet
        bet_manager::cancel_bet(bet_id);

        let lock_amount = (bet_amount * LIQUIDITY_LOCK_RATIO) / BASIS_POINTS;
        liquidity_manager::unlock_liquidity(lock_amount);

        // refund the user
        let resolver_fee = (bet_amount * RESOLVER_FEE) / BASIS_POINTS;
        let total_refund = bet_amount - resolver_fee;
        assert!(total_refund <= liquidity_manager::get_total_liquidity(), get_error_code(8));
        vault::transfer_to_user(bet_user, total_refund);
        vault::transfer_to_user(user_address, resolver_fee);

        // emit event
        events::emit_bet_cancelled_event(bet_id);

        // check and update pause state
        check_and_update_pause_state();
    }

    public entry fun resolve_bet(user: &signer, bet_id: u64, update_data: vector<vector<u8>>) acquires Flashbet {
        let bet_opt = bet_manager::get_bet(bet_id);
        assert!(option::is_some(&bet_opt), get_error_code(14));
        // TODO: check if status is pending and expiry time has passed and less then 60 seconds from expiry time

        let user_address = signer::address_of(user);

        // update price feed
        let current_price = price_feed::get_price(user, update_data);

        let (won, payout, early_resolve) = bet_manager::resolve_bet(bet_id, current_price, user_address);
        if (early_resolve) {
            // if early resolved, just cancel the bet without any payout
            cancel_bet(user, bet_id);
            return;
        };

        let bet_ref = option::borrow(&bet_opt);
        let (_,bet_user,bet_amount,_,_,_,_,_,_,_) = bet_manager::unpack_bet(bet_ref);

        let lock_amount = (bet_amount * LIQUIDITY_LOCK_RATIO) / BASIS_POINTS;
        liquidity_manager::unlock_liquidity(lock_amount);

        let total_payout;
        if (won) {
            total_payout = bet_amount + payout;
            let protocol_fee = (bet_amount * PROTOCOL_FEE) / BASIS_POINTS;
            let resolver_fee = (bet_amount * RESOLVER_FEE) / BASIS_POINTS;
            let net_payout = total_payout - protocol_fee - resolver_fee;

            assert!(total_payout <= liquidity_manager::get_total_liquidity(), get_error_code(8));
            
            vault::transfer_to_user(user_address, resolver_fee);
            vault::transfer_to_user(bet_user, net_payout);
            
        } else {
            // pay the resolver fee from liquidity pool
            let resolver_fee = (bet_amount * RESOLVER_FEE) / BASIS_POINTS;
            total_payout = resolver_fee;

            assert!(total_payout <= liquidity_manager::get_total_liquidity(), get_error_code(8));
            
            vault::transfer_to_user(user_address, resolver_fee);
        };

        // distribute PnL to liquidity pool
        let pnl_positive = if (won) total_payout as u128 else 0;
        let pnl_negative = if (!won) total_payout as u128 else 0;

        liquidity_manager::distribute_pnl(pnl_positive, pnl_negative);
    }

    public entry fun add_liquidity(user: &signer, amount: u64) acquires Flashbet {
        let sender = signer::address_of(user);
        vault::transfer_to_flashbet(user, amount);
        liquidity_manager::add_liquidity(sender, amount);
        check_and_update_pause_state();
    }

    public entry fun remove_liquidity(user: &signer, amount: u64) acquires Flashbet {
        let available = liquidity_manager::get_available_liquidity();
        let user_address = signer::address_of(user);
        assert!(available >= amount, 300);
        liquidity_manager::remove_liquidity(user_address, amount);
        vault::transfer_to_user(user_address, amount);
        check_and_update_pause_state();
    }

    #[view]
    public fun get_market_state(): (u64, u64, bool) acquires Flashbet {
        let flashbet = borrow_global<Flashbet>(@flashbet);
        (liquidity_manager::get_total_liquidity(), liquidity_manager::get_available_liquidity(), flashbet.is_paused)
    }

    #[view]
    public fun get_provider_liquidity(provider: address): option::Option<ProviderBalance> {
        liquidity_manager::get_provider_liquidity(provider)
    }

    #[view]
    public fun get_bet_info(bet_id: u64): option::Option<bet_manager::Bet> {
        bet_manager::get_bet(bet_id)
    }

    #[view]
    public fun get_user_bets(user: address): option::Option<vector<u64>> {
        bet_manager::get_user_bets(user)
    }
}