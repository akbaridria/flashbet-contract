module flashbet::price_feed {
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::object::{Self, Object};
    use switchboard::aggregator::{Self, Aggregator, CurrentResult};
    use switchboard::decimal::Decimal;
    use switchboard::update_action;

    public(package) fun update_and_return(account: &signer, update_data: vector<vector<u8>>, aggregator_address: address): (u128, u64, bool) {
        update_action::run<AptosCoin>(account, update_data);

        let aggregator: Object<Aggregator> = object::address_to_object<Aggregator>(aggregator_address);
        let current_result: CurrentResult = aggregator::current_result(aggregator);

        let result: Decimal = current_result.result();
        let (result_u128, result_neg) = result.unpack();
        let timestamp_seconds = current_result.timestamp();
        
        (result_u128, timestamp_seconds, result_neg)
    }
}