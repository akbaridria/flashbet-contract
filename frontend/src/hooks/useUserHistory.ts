import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getUserHistory } from "@/services/flashbet";

export function useUserHistory(address: string | null) {
  return useQuery({
    queryKey: queryKeys.userHistory(address || ""),
    queryFn: () => getUserHistory(address as `0x${string}`),
    enabled: !!address,
    select: (data) => ({
      raw: data,
      formatted: data?.[0]?.vec?.[0] || [],
    }),
  });
}
