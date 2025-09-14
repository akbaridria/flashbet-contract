module flashbet::errors {
    const E_NOT_ADMIN: u64 = 1;
    const E_ALREADY_RESOLVED: u64 = 2;
    const E_NOT_EXPIRED: u64 = 3;
    const E_NOT_PENDING: u64 = 4;
    const E_PROVIDER_NOT_FOUND: u64 = 5;
    const E_INSUFFICIENT_EFFECTIVE_BALANCE: u64 = 6;
    const E_INSUFFICIENT_STAKE: u64 = 7;
    const E_INSUFFICIENT_AVAILABLE_LIQUIDITY: u64 = 8;
    const E_MARKET_PAUSED: u64 = 9;
    const E_INVALID_DURATION: u64 = 10;
    const E_INVALID_BET_AMOUNT: u64 = 11;
    const E_NEGATIVE_PRICE: u64 = 12;
    const E_PRICE_SLIPPAGE_EXCEEDED: u64 = 13;
    const E_BET_NOT_FOUND: u64 = 14;

    public(package) fun get_error_code(bet_type: u8): u64 {
        if (bet_type == 1) {
            E_NOT_ADMIN
        } else if (bet_type == 2) {
            E_ALREADY_RESOLVED
        } else if (bet_type == 3) {
            E_NOT_EXPIRED
        } else if (bet_type == 4) {
            E_NOT_PENDING
        } else if (bet_type == 5) {
            E_PROVIDER_NOT_FOUND
        } else if (bet_type == 6) {
            E_INSUFFICIENT_EFFECTIVE_BALANCE
        } else if (bet_type == 7) {
            E_INSUFFICIENT_STAKE
        } else if(bet_type == 8) {
            E_INSUFFICIENT_AVAILABLE_LIQUIDITY
        } else if (bet_type == 9) {
            E_MARKET_PAUSED
        } else if (bet_type == 10) {
            E_INVALID_DURATION
        } else if (bet_type == 11) {
            E_INVALID_BET_AMOUNT
        } else if (bet_type == 12) {
            E_NEGATIVE_PRICE
        } else if (bet_type == 13) {
            E_PRICE_SLIPPAGE_EXCEEDED
        } else if (bet_type == 14) {
            E_BET_NOT_FOUND
        } else {
            bet_type as u64
        }
    }
}