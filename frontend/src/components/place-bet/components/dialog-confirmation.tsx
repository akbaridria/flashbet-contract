import CurrentBtcPrice from "@/components/current-btc-price";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DURATION_OPTIONS } from "@/config/constant";
import { usePlacebet } from "@/hooks/usePlacebet";
import { getBtcPrice } from "@/lib/utils";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface DialogConfirmationBetProps {
  betDirection: "up" | "down";
  betAmount: string;
  betDuration: number;
  resetForm: () => void;
}

const DialogConfirmationBet: React.FC<DialogConfirmationBetProps> = ({
  betDirection,
  betAmount,
  betDuration,
  resetForm,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [btcPrice, setBtcPrice] = useState<string | null>(null);
  const [selectedSlippage, setSelectedSlippage] = useState(3);
  const slippageOptions = [1, 2, 3, 4, 5];
  const { account } = useWallet();

  const { mutateAsync, isPending } = usePlacebet({
    address: account?.address.toStringLong() || "",
    isLong: betDirection === "up",
    amount: String(Number(betAmount) * 1e6 || 0),
    duration: betDuration,
    slippagePrice: btcPrice
      ? (
          parseFloat(btcPrice) *
          (1 +
            (betDirection === "up" ? selectedSlippage : -selectedSlippage) /
              100)
        ).toFixed(0)
      : "0",
  });

  const handleConfirm = useCallback(async () => {
    mutateAsync().then(() => {
      setIsOpen(false);
      resetForm();
    });
  }, [mutateAsync, resetForm]);

  useEffect(() => {
    if (isOpen) {
      (async () => {
        const res = await getBtcPrice();
        const rawPrice = res?.price || null;
        setBtcPrice(rawPrice);
      })();
    }
  }, [isOpen]);

  const isSubmitDisabled = useMemo(() => {
    return (
      !betDirection ||
      !betDuration ||
      !betAmount ||
      isNaN(Number(betAmount)) ||
      Number(betAmount) < 2 ||
      Number(betAmount) > 1000
    );
  }, [betDirection, betDuration, betAmount]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={isSubmitDisabled}>
          Place Bet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Bet</DialogTitle>
          <DialogDescription>
            Please review your bet details before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bet Direction */}
          <div className="flex items-center border justify-between p-3 bg-card rounded-lg">
            <span className="text-sm font-medium">Direction</span>
            <div className="flex items-center gap-2">
              {betDirection === "up" ? (
                <>
                  <TrendingUpIcon className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-green-500">UP</span>
                </>
              ) : (
                <>
                  <TrendingDownIcon className="h-4 w-4 text-red-500" />
                  <span className="font-semibold text-red-500">DOWN</span>
                </>
              )}
            </div>
          </div>

          {/* Bet Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">
                {
                  DURATION_OPTIONS.find(
                    (option) => option.value === betDuration
                  )?.label
                }
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">${betAmount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Potential Profit</span>
              <span className="font-medium text-green-400">
                +$
                {betAmount ? (parseFloat(betAmount) * 1.75).toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Multiplier</span>
              <span className="font-medium">1.75x</span>
            </div>
            <div className="p-4 max-w-md mx-auto bg-card rounded-lg border shadow-lg mt-4">
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">Price Slippage</span>
                <span className="font-medium text-foreground">
                  {selectedSlippage}%
                </span>
              </div>

              <div className="flex bg-muted rounded-lg p-1">
                {slippageOptions.map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => setSelectedSlippage(percentage)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedSlippage === percentage
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {percentage}%
                  </button>
                ))}
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                Price slippage ensures your bet is only placed if the entry
                price is within your selected slippage range from the current
                price.
              </div>
            </div>
          </div>
          <div className="border bg-card rounded-lg p-3">
            <CurrentBtcPrice />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button className="flex-1" variant="secondary" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={isPending}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogConfirmationBet;
