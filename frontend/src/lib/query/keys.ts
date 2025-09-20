export const queryKeys = {
  balance: (address: string) => ["balance", address] as const,
  marketState: () => ["market-state"] as const,
} as const;
