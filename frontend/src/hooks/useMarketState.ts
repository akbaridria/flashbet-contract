import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getMarketState } from "@/services/flashbet";

export function useMarketStateQuery() {
  return useQuery({
    queryKey: queryKeys.marketState(),
    queryFn: () => getMarketState(),
    enabled: true,
    select: (data) => ({
      raw: data,
      totalLiquidity: Number(data[0]) / 1e6,
      availableLiquidity: Number(data[1]) / 1e6,
      isPaused: data[2],
    }),
  });
}
