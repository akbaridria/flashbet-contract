export const queryKeys = {
  balance: (address: string) => ["balance", address] as const,
  marketState: () => ["market-state"] as const,
  providerBalance: (address: string) => ["provider-balance", address] as const,
  userHistory: (address: string) => ["user-history", address] as const,
  betInfo: (betId: string) => ["bet-info", betId] as const,
} as const;
