module flashbet::errors {
    const E_NOT_ADMIN: u64 = 1;
    const E_ALREADY_RESOLVED: u64 = 2;
    const E_NOT_EXPIRED: u64 = 3;
    const E_NOT_PENDING: u64 = 4;
    const E_PROVIDER_NOT_FOUND: u64 = 5;
    const E_INSUFFICIENT_EFFECTIVE_BALANCE: u64 = 6;
    const E_INSUFFICIENT_STAKE: u64 = 7;

    public fun get_error_code(bet_type: u8): u64 {
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
        } else {
            bet_type as u64
        }

        
    }
}