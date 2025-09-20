export const queryKeys = {
  balance: (address: string) =>
    ["balance", address] as const,
} as const;


