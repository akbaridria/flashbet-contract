module flashbet::price_feed {
    use pyth::pyth;
    use pyth::price_identifier;
    use pyth::i64;
    use pyth::price::{Self};

    use aptos_framework::coin;

    struct PriceFeed has key {
        price_feed_id: vector<u8>
    }

    public(package) fun init_price_feed(account: &signer, price_feed_id: vector<u8>) {
        move_to(account, PriceFeed {
            price_feed_id
        });
    }
 
    public(package) fun get_price(user: &signer, pyth_price_update: vector<vector<u8>>): u64 {
        let price_feed = borrow_global<PriceFeed>(@flashbet);
        let coins = coin::withdraw(user, pyth::get_update_fee(&pyth_price_update));
        pyth::update_price_feeds(pyth_price_update, coins);

        let btc_usd_price_id = price_identifier::from_byte_vec(price_feed.price_feed_id);
        let price = pyth::get_price(btc_usd_price_id);
        let price_positive = i64::get_magnitude_if_positive(&price::get_price(&price));

        price_positive
    }
}