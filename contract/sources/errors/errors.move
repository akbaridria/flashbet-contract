module flashbet::errors {
    use aptos_framework::vector;

    const ERROR_CODES: vector<u64> = vector[
        0, // index 0 unused or default
        1, // E_NOT_ADMIN
        2, // E_ALREADY_RESOLVED
        3, // E_NOT_EXPIRED
        4, // E_NOT_PENDING
        5, // E_PROVIDER_NOT_FOUND
        6, // E_INSUFFICIENT_EFFECTIVE_BALANCE
        7, // E_INSUFFICIENT_STAKE
        8, // E_INSUFFICIENT_AVAILABLE_LIQUIDITY
        9, // E_MARKET_PAUSED
        10, // E_INVALID_DURATION
        11, // E_INVALID_BET_AMOUNT
        12, // E_NEGATIVE_PRICE
        13, // E_PRICE_SLIPPAGE_EXCEEDED
        14 // E_BET_NOT_FOUND
    ];

    public(package) fun get_error_code(bet_type: u8): u64 {
        let idx = bet_type as u64;
        if (idx < vector::length(&ERROR_CODES)) {
            ERROR_CODES[idx]
        } else { idx }
    }
}
