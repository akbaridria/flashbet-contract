import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getProviderBalance } from "@/services/flashbet";

export function useProviderBalanceQuery(address: string | null) {
  return useQuery({
    queryKey: queryKeys.providerBalance(address || ""),
    queryFn: () => getProviderBalance(address as `0x${string}`),
    enabled: !!address,
    select: (data) => ({
      raw: data,
      formatted: data?.[0]?.vec?.[0]?.effective_balance
        ? Number(data[0].vec[0].effective_balance) / 1e6
        : 0,
    }),
  });
}
