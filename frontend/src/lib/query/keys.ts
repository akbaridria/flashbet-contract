export const queryKeys = {
  balance: (address: string) => ["balance", address] as const,
  marketState: () => ["market-state"] as const,
  providerBalance: (address: string) => ["provider-balance", address] as const,
} as const;
