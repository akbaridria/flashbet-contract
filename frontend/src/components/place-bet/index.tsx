import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import WalletOverlay from "../wallet-overlay";
import { Input } from "../ui/input";
import CurrentBtcPrice from "../current-btc-price";
import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { useBalanceQuery } from "@/hooks/useBalance";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const durationOptions = [
  { label: "2m", value: 60 * 2 },
  { label: "3m", value: 60 * 3 },
  { label: "5m", value: 60 * 5 },
  { label: "10m", value: 60 * 10 },
];

const PlaceBet = () => {
  const { account } = useWallet();
  const [betDirection, setBetDirection] = useState<"up" | "down">("up");
  const [betAmount, setBetAmount] = useState("");
  const [betDuration, setBetDuration] = useState(0);
  const { data: balance } = useBalanceQuery(
    account?.address.toStringLong() || null
  );

  return (
    <WalletOverlay description="Connect your wallet to start a prediction">
      <div className="p-4 bg-card rounded-lg border border-primary border-dashed space-y-4">
        <div className="flex flex-col">
          <div className="text-lg font-semibold">Place Your Bet</div>
          <div className="text-xs text-muted-foreground">
            Enter your trading position
          </div>
        </div>
        <div className="space-y-2">
          <Label>Direction</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={betDirection === "up" ? "default" : "outline"}
              onClick={() => setBetDirection("up")}
              className="transition-all duration-300"
            >
              <TrendingUpIcon className="mr-2 h-4 w-4" />
              Up
            </Button>
            <Button
              variant={betDirection === "down" ? "destructive" : "outline"}
              onClick={() => setBetDirection("down")}
              className="transition-all duration-300"
            >
              <TrendingDownIcon className="mr-2 h-4 w-4" />
              Down
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <div className="flex items-center gap-2 flex-wrap">
            {durationOptions.map((option) => (
              <div
                key={option.label}
                className={cn(
                  "bg-input/20 border rounded-lg px-4 py-1 hover:bg-input/30 hover:border-primary transition-colors cursor-pointer",
                  {
                    "border-primary bg-input/30": betDuration === option.value,
                  }
                )}
                onClick={() => setBetDuration(option.value)}
              >
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
          />
          <p className="text-right text-xs">
            Your balance:{" "}
            {balance?.formatted ? formatCurrency(balance.formatted) : "-"}
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <CurrentBtcPrice />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Potential Profit</span>
            <span className="font-medium text-green-400">
              +${betAmount ? (parseFloat(betAmount) * 1.75).toFixed(2) : "0.00"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Multiplier</span>
            <span className="font-medium">1.75x</span>
          </div>
        </div>
      </div>
    </WalletOverlay>
  );
};

export default PlaceBet;
