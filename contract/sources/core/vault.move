module flashbet::vault {
    use aptos_framework::coin;
    use aptos_framework::signer;
    
    use flashbet::usdc;

    struct Vault has key {
        usdc: coin::Coin<usdc::USDC>,
    }

    public(package) fun init_vault(account: &signer) {
        move_to(account, Vault {
            usdc: coin::zero<usdc::USDC>(),
        });
    }

    public(package) fun transfer_to_flashbet(account: &signer, amount: u64) acquires Vault {
        let coin_in = coin::withdraw<usdc::USDC>(account, amount);
        let vault = borrow_global_mut<Vault>(signer::address_of(account));
        coin::merge(&mut vault.usdc, coin_in);
    }

    public(package) fun transfer_to_user(user: address, amount: u64) acquires Vault {
        let vault = borrow_global_mut<Vault>(@flashbet);
        let coin_to_transfer = coin::extract(&mut vault.usdc, amount);
        coin::deposit(user, coin_to_transfer);
    }

}