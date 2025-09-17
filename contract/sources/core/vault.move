module flashbet::vault {
    use aptos_framework::signer;
    use aptos_framework::fungible_asset;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::object;
    use mock_usdc::usdc;

    struct Vault has key {
        extend_ref: object::ExtendRef,
        vault_addr: address,
    }

    public(package) fun initialize(account: &signer) {
        let constructor_ref = object::create_named_object(account, b"vault");
        let extend_ref = object::generate_extend_ref(&constructor_ref);
        let vault_signer = object::generate_signer(&constructor_ref);
        let vault_addr = signer::address_of(&vault_signer);
        
        move_to(account, Vault { extend_ref, vault_addr });
    }

    public(package) fun transfer_to_flashbet(account: &signer, amount: u64) acquires Vault {
        let vault_info = borrow_global<Vault>(@flashbet);
        let user_addr = signer::address_of(account);
        let metadata = usdc::get_metadata();

        let user_wallet = primary_fungible_store::ensure_primary_store_exists(user_addr, metadata);
        let vault_wallet = primary_fungible_store::ensure_primary_store_exists(vault_info.vault_addr, metadata);
        
        fungible_asset::transfer(
            account,
            user_wallet,
            vault_wallet,
            amount,
        );
    }

    public(package) fun transfer_to_user(user_addr: address, amount: u64) acquires Vault {
        let vault_info = borrow_global<Vault>(@flashbet);
        let vault_signer = object::generate_signer_for_extending(&vault_info.extend_ref);

        let metadata = usdc::get_metadata();

        let user_wallet = primary_fungible_store::ensure_primary_store_exists(user_addr, metadata);
        let vault_wallet = primary_fungible_store::ensure_primary_store_exists(vault_info.vault_addr, metadata);

        fungible_asset::transfer(&vault_signer, vault_wallet, user_wallet, amount);
    }

    #[view]
    public fun get_vault_balance(): u64 acquires Vault {
        let metadata = usdc::get_metadata();
        let vault_ref = borrow_global<Vault>(@flashbet);
        primary_fungible_store::balance(vault_ref.vault_addr, metadata)
    }
}