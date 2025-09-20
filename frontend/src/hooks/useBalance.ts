import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getFungibleAssetBalance } from "@/services/fungible-asset";

export function useBalanceQuery(
  address: string | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: queryKeys.balance(address || ""),
    queryFn: () => getFungibleAssetBalance(address as `0x${string}`),
    enabled: !!address && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval ?? 30_000,
    select: (data) => ({
      raw: data,
      formatted: Number(data) / 1e6,
    }),
  });
}
