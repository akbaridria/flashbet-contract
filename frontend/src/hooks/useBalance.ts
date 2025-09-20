import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getFungibleAssetBalance } from "@/services/fungible-asset";

export function useBalanceQuery(
  address: string | null,
) {
  return useQuery({
    queryKey: queryKeys.balance(address || ""),
    queryFn: () => getFungibleAssetBalance(address as `0x${string}`),
    enabled: !!address,
    select: (data) => ({
      raw: data,
      formatted: Number(data) / 1e6,
    }),
  });
}
