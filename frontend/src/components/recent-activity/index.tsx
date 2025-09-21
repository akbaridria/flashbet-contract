import { useWallet } from "@aptos-labs/wallet-adapter-react";
import WalletOverlay from "../wallet-overlay";
import { useUserHistory } from "@/hooks/useUserHistory";
import {
  Activity,
  TimerIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useGetBetInfo } from "@/hooks/useGetBetInfo";
import { Badge } from "../ui/badge";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

export interface BetInfo {
  amount: string;
  entry_price: string;
  entry_time: string;
  expiry_time: string;
  id: string;
  is_long: boolean;
  resolver: string;
  status: Status;
  user: string;
  won: boolean;
}

export interface Status {
  __variant__: "Pending" | "Resolved" | "Cancelled";
}

const ItemActivity: React.FC<{ betId: string }> = ({ betId }) => {
  const { data } = useGetBetInfo(betId);

  const betDetail = useMemo(() => {
    return data?.raw?.[0]?.vec?.[0] as BetInfo | undefined;
  }, [data]);

  const getBetStatus = (status: Status) => {
    switch (status.__variant__) {
      case "Pending":
        return "outline";
      case "Resolved":
        return "default";
      case "Cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (!betDetail) return null;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-accent">
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {betDetail?.is_long ? (
              <TrendingUpIcon className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDownIcon className="h-4 w-4 text-red-400" />
            )}
            <div>
              <p className="text-sm font-medium">
                {formatCurrency(Number(betDetail.amount) / 1e6)}
                <sub className="text-xs"> usdc</sub>
              </p>
              <p className="text-xs text-muted-foreground">
                {betDetail.entry_time
                  ? format(
                      new Date(Number(betDetail.entry_time) * 1000),
                      "MMM d, HH:mm"
                    )
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                getBetStatus(betDetail.status) as
                  | "default"
                  | "destructive"
                  | "outline"
                  | "secondary"
              }
            >
              {betDetail.status.__variant__}
            </Badge>
            <div className="text-right">
              <p
                className={`text-sm font-medium ${
                  ["Cancelled", "Pending"].includes(
                    betDetail.status.__variant__
                  )
                    ? "text-yellow-400"
                    : betDetail.status.__variant__ === "Resolved"
                    ? betDetail.won
                      ? "text-green-400"
                      : "text-red-400"
                    : "text-muted-foreground"
                }`}
              >
                {["Cancelled", "Pending"].includes(betDetail.status.__variant__)
                  ? "0"
                  : betDetail.status.__variant__ === "Resolved"
                  ? betDetail.won
                    ? `+${formatCurrency(
                        (Number(betDetail.amount) / 1e6) * 1.75
                      )}`
                    : `-${formatCurrency(
                        (Number(betDetail.amount) / 1e6) * 1.75
                      )}`
                  : "-"}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TimerIcon className="h-3 w-3" />
                {betDetail?.expiry_time
                  ? formatDistanceToNow(
                      new Date(Number(betDetail.expiry_time) * 1000),
                      {
                        addSuffix: true,
                      }
                    )
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentActivity = () => {
  const { account } = useWallet();
  const { data: userBets } = useUserHistory(
    account?.address.toStringLong() || null
  );

  const listBets = userBets?.formatted || [];

  const hasNoBets = !listBets || listBets.length === 0;

  return (
    <WalletOverlay>
      <div className="p-4 bg-card rounded-lg border border-secondary space-y-4">
        <div>
          <div className="text-lg font-semibold">Recent Activity</div>
          <div className="text-xs text-muted-foreground">
            View your recent bets
          </div>
        </div>

        {hasNoBets ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="p-3 bg-muted rounded-full">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                No recent activity
              </p>
              <p className="text-xs text-muted-foreground">
                Your betting history will appear here once you place your first
                bet
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {listBets
              ?.slice()
              .reverse()
              .map((betId: string) => (
                <ItemActivity key={betId} betId={betId} />
              ))}
          </div>
        )}
      </div>
    </WalletOverlay>
  );
};

export default RecentActivity;
