#[test_only]
module flashbet::test_flashbet {

    use aptos_framework::timestamp;
    use aptos_framework::fungible_asset;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::signer;
    use aptos_framework::vector;

    use flashbet::flashbet_core;
    use flashbet::liquidity_manager;
    use flashbet::mock_price_feed;

    use mock_usdc::usdc;

    const USER1: address = @0x123;
    const USER2: address = @0x456;
    const LP_PROVIDER: address = @0x789;

    #[test(mock_usdc = @mock_usdc)]
    fun test_mint_usdc(mock_usdc: &signer) {
        usdc::init_module_for_test(mock_usdc);
        let metadata = usdc::get_metadata();
        let user1_store = primary_fungible_store::ensure_primary_store_exists(USER1, metadata);
        let balance_before = fungible_asset::balance(user1_store);
        usdc::mint(USER1);
        let balance_after = fungible_asset::balance(user1_store);
        assert!(balance_after > balance_before, 1);
    }

    #[test(admin = @flashbet, mock_usdc = @mock_usdc, aptos_framework = @0x1, lp_provider = @0x789, user1 = @0x123)]
    fun test_basic_flow(admin: &signer, mock_usdc: &signer, aptos_framework: &signer, lp_provider: &signer, user1: &signer) {
        // initialize modules
        timestamp::set_time_has_started_for_testing(aptos_framework);
        usdc::init_module_for_test(mock_usdc);
        flashbet_core::init_module_for_test(admin);
        mock_price_feed::init_price_feed(admin, 0);

        // mint usdc for users and lp provider
        usdc::mint(signer::address_of(user1));
        usdc::mint(signer::address_of(lp_provider));

        // add liquidity
        let lp_amount = 100_000_000; // 100 USDC (with
        flashbet_core::add_liquidity(lp_provider, lp_amount);
        assert!(liquidity_manager::get_total_liquidity() == lp_amount, 1);

        // place bet
        let initial_price = 50_000;
        mock_price_feed::set_price(admin, initial_price);
        let bet_amount = 10_000_000; // 10 USDC (with 6 decimal places)
        let duration = 300; // 5 minutes
        let is_long = true;
        let slippage_price = initial_price;
        let update_data = vector::empty<vector<u8>>();
        flashbet_core::place_bet(user1, bet_amount, duration, is_long, slippage_price, update_data);
        assert!(liquidity_manager::get_locked_liquidity() > 0, 2);
        assert!(flashbet_core::get_vault_balance() > 0, 3);

        // fast forward time to when bet can be resolved
        timestamp::fast_forward_seconds(duration);

        // set exit price
        let exit_price = 52_000; // Price moved up to $52,000
        mock_price_feed::set_price(admin, exit_price);
        let update_data = vector::empty<vector<u8>>();

        // resolve bet
        flashbet_core::resolve_bet(admin, 1, update_data);
        assert!(liquidity_manager::get_locked_liquidity() == 0, 3);
        assert!(flashbet_core::get_vault_balance() < lp_amount, 4);
    }

    #[test(admin = @flashbet, mock_usdc = @mock_usdc, aptos_framework = @0x1, lp_provider = @0x789, user1 = @0x123)]
    fun test_auto_cancel_on_late_resolution(admin: &signer, mock_usdc: &signer, aptos_framework: &signer, lp_provider: &signer, user1: &signer) {
        // initialize modules
        timestamp::set_time_has_started_for_testing(aptos_framework);
        usdc::init_module_for_test(mock_usdc);
        flashbet_core::init_module_for_test(admin);
        mock_price_feed::init_price_feed(admin, 0);

        // mint usdc for users and lp provider
        usdc::mint(signer::address_of(user1));
        usdc::mint(signer::address_of(lp_provider));

        // add liquidity
        let lp_amount = 100_000_000; // 100 USDC (with
        flashbet_core::add_liquidity(lp_provider, lp_amount);
        assert!(liquidity_manager::get_total_liquidity() == lp_amount, 1);
        assert!(flashbet_core::get_vault_balance() == lp_amount, 1);

        // place bet
        let initial_price = 50_000;
        mock_price_feed::set_price(admin, initial_price);
        let bet_amount = 10_000_000; // 10 USDC (with 6 decimal places)
        let duration = 300; // 5 minutes
        let is_long = true;
        let slippage_price = initial_price;
        let update_data = vector::empty<vector<u8>>();
        flashbet_core::place_bet(user1, bet_amount, duration, is_long, slippage_price, update_data);
        assert!(liquidity_manager::get_locked_liquidity() > 0, 2);
        assert!(flashbet_core::get_vault_balance() > 0, 3);

        // fast forward time to when bet can be resolved
        timestamp::fast_forward_seconds(duration + 120);

        // set exit price
        let exit_price = 52_000; // Price moved up to $52,000
        mock_price_feed::set_price(admin, exit_price);
        let update_data = vector::empty<vector<u8>>();

        // resolve bet
        flashbet_core::resolve_bet(admin, 1, update_data);

        assert!(liquidity_manager::get_locked_liquidity() == 0, 3);
        assert!(flashbet_core::get_vault_balance() < lp_amount, 4);
    }

    #[test(admin = @flashbet, mock_usdc = @0x1, user1 = @0x123, lp = @0x789)]
    fun test_liquidity_management(
        admin: &signer,
        mock_usdc: &signer,
        user1: &signer,
        lp: &signer
    ) {
        // Setup test environment
        setup_test(admin, mock_usdc);
        
        // Mint USDC for users and LP provider
        usdc::mint(signer::address_of(admin)); // Admin/protocol address
        usdc::mint(signer::address_of(user1));
        usdc::mint(signer::address_of(lp));
        
        // Set initial price in mock price feed
        let initial_price = 50000; // $50,000 as the initial BTC price
        mock_price_feed::set_price(admin, initial_price);

        // Check initial liquidity
        assert!(liquidity_manager::get_total_liquidity() == 0, 1);
        
        // Add liquidity
        // Each mint gives 100 USDC, and users need to explicitly add liquidity
        let lp_amount = 100_000_000; // 100 USDC (with 6 decimal places)
        test_add_liquidity(lp, lp_amount);
        
        // Check liquidity was added correctly
        assert!(liquidity_manager::get_total_liquidity() == lp_amount, 2);
        
        // Place a bet to lock some liquidity
        let bet_amount = 10_000_000; // 10 USDC (with 6 decimal places)
        let duration = 300; // 5 minutes
        let is_long = true;
        test_place_bet(user1, bet_amount, duration, is_long, initial_price);
        
        // Check locked liquidity
        let locked_amount = (bet_amount * 7500) / 10000; // Based on the LIQUIDITY_LOCK_RATIO
        assert!(liquidity_manager::get_locked_liquidity() == locked_amount, 3);
        
        // Fast forward time to when bet can be resolved
        timestamp::fast_forward_seconds(duration);
        
        // Set exit price
        let exit_price = 52000; // Price moved up to $52,000
        mock_price_feed::set_price(admin, exit_price);
        
        // Resolve bet
        test_resolve_bet(admin, 1, exit_price);
        
        // Check liquidity is unlocked
        assert!(liquidity_manager::get_locked_liquidity() == 0, 4);
        
        // Remove some liquidity
        let remove_amount = 50_000_000; // 50 USDC (with 6 decimal places)
        test_remove_liquidity(lp, remove_amount);
        
        // Check remaining liquidity
        assert!(liquidity_manager::get_total_liquidity() == lp_amount - remove_amount, 5);
    }

    // Helper functions for testing

    fun setup_test(admin: &signer, mock_usdc: &signer) {
        usdc::init_module_for_test(admin);
        flashbet_core::init_module_for_test(mock_usdc);
        mock_price_feed::init_price_feed(admin, 0);
    }

    fun test_add_liquidity(lp: &signer, amount: u64) {
        flashbet_core::add_liquidity(lp, amount);
    }

    fun test_remove_liquidity(lp: &signer, amount: u64) {
        flashbet_core::remove_liquidity(lp, amount);
    }

    fun test_place_bet(user: &signer, amount: u64, duration: u64, is_long: bool, slippage_price: u64) {
        let update_data = vector::empty<vector<u8>>();
        flashbet_core::place_bet(user, amount, duration, is_long, slippage_price, update_data);
    }

    fun test_resolve_bet(user: &signer, bet_id: u64, _current_price: u64) {
        let update_data = vector::empty<vector<u8>>();
        flashbet_core::resolve_bet(user, bet_id, update_data);
    }
}
