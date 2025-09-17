module flashbet::mock_price_feed {
    use aptos_framework::signer;

    struct PriceFeed has key {
        price: u64
    }

    public fun init_price_feed(account: &signer, price: u64) {
        move_to(account, PriceFeed { price });
    }

    public fun set_price(account: &signer, price: u64) acquires PriceFeed {
        let feed = borrow_global_mut<PriceFeed>(signer::address_of(account));
        feed.price = price;
    }

    public fun get_price(
        _user: &signer, _pyth_price_update: vector<vector<u8>>
    ): u64 acquires PriceFeed {
        let feed = borrow_global<PriceFeed>(@flashbet);
        feed.price
    }
}
