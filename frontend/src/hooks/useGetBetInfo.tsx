import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getBetInfo } from "@/services/flashbet";

export function useGetBetInfo(betId: string | null) {
  return useQuery({
    queryKey: queryKeys.betInfo(betId || ""),
    queryFn: () => getBetInfo(betId as string),
    enabled: !!betId,
    select: (data) => ({
      raw: data,
    }),
  });
}
