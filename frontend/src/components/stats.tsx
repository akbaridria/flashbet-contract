import { DropletIcon, GaugeIcon, LockIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useMarketStateQuery } from "@/hooks/useMarketState";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

const Stats = () => {
  const { data } = useMarketStateQuery();

  const { totalLiquidity, totalLockedLiquidity, utilizationRate } =
    useMemo(() => {
      return {
        totalLiquidity: data?.totalLiquidity
          ? formatCurrency(data.totalLiquidity)
          : "--",
        totalLockedLiquidity:
          data?.availableLiquidity && data?.totalLiquidity
            ? formatCurrency(data.totalLiquidity - data.availableLiquidity)
            : "--",
        utilizationRate:
          data?.availableLiquidity && data?.totalLiquidity
            ? `${(
                ((data.totalLiquidity - data.availableLiquidity) /
                  data.totalLiquidity) *
                100
              ).toFixed(4)}%`
            : "--",
      };
    }, [data]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-secondary ">
        <CardHeader>
          <CardTitle>Total Liquidity</CardTitle>
          <CardAction>
            <DropletIcon className="h-6 w-6 text-primary" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalLiquidity}
            <sub className="text-xs ml-1">USDC</sub>
          </div>
          <p className="text-xs text-muted-foreground">Total Liquidity</p>
        </CardContent>
      </Card>
      <Card className="border-secondary ">
        <CardHeader>
          <CardTitle>Total Locked Liquidity</CardTitle>
          <CardAction>
            <LockIcon className="h-6 w-6 text-primary" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalLockedLiquidity}
            <sub className="text-xs ml-1">USDC</sub>
          </div>
          <p className="text-xs text-muted-foreground">In active positions</p>
        </CardContent>
      </Card>
      <Card className="border-secondary ">
        <CardHeader>
          <CardTitle>Utilization Rate</CardTitle>
          <CardAction>
            <GaugeIcon className="h-6 w-6 text-primary" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{utilizationRate}</div>
          <p className="text-xs text-muted-foreground">
            Percentage of liquidity currently in use
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;
