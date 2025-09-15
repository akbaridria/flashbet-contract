module mock_usdc::usdc {
    use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use std::string::utf8;
    use aptos_framework::option;
    
    const ENOT_OWNER: u64 = 1;
    const ASSET_SYMBOL: vector<u8> = b"USDC";
    const ASSET_NAME: vector<u8> = b"USD Coin";
    const MAX_MINT_AMOUNT: u64 = 100_000_000;
    struct ManagedFungibleAsset has key {
        mint_ref: MintRef,
        transfer_ref: TransferRef,
        burn_ref: BurnRef,
    }
    
    
    fun init_module(admin: &signer) {
        let constructor_ref = &object::create_named_object(admin, ASSET_SYMBOL);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            utf8(ASSET_NAME), 
            utf8(ASSET_SYMBOL), 
            6, 
            utf8(b""), 
            utf8(b""), 
        );

        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);
        let metadata_object_signer = object::generate_signer(constructor_ref);
        move_to(
            &metadata_object_signer,
            ManagedFungibleAsset { mint_ref, transfer_ref, burn_ref }
        );
    }

    public fun get_metadata(): Object<Metadata> {
        let asset_address = object::create_object_address(&@mock_usdc, ASSET_SYMBOL);
        object::address_to_object<Metadata>(asset_address)
    }

    public entry fun mint(to: address) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let managed_fungible_asset = borrow_global<ManagedFungibleAsset>(object::object_address(&asset));
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        let fa = fungible_asset::mint(&managed_fungible_asset.mint_ref, MAX_MINT_AMOUNT);
        fungible_asset::deposit_with_ref(&managed_fungible_asset.transfer_ref, to_wallet, fa);
    }
}