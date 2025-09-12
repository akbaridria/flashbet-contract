module flashbet::usdc {
    use aptos_framework::signer;

    struct USDC has key { dummy: bool }

    public fun init(owner: &signer) {
        aptos_framework::managed_coin::initialize<USDC>(
            owner,
            b"USD Coin",
            b"USDC",
            6,
            false,
        );
        let amount = 100_000_000_000_000;
        aptos_framework::managed_coin::mint<USDC>(owner, signer::address_of(owner), amount);
    }

    // public function for faucet in test environment
    public fun mint(user: &signer) {
        let amount = 100_000_000; // 100 USDC
        aptos_framework::managed_coin::mint<USDC>(user, signer::address_of(user), amount);
    }
}