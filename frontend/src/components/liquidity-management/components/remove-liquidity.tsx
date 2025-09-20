import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProviderBalanceQuery } from "@/hooks/useProviderBalance";
import { useRemoveLiquidity } from "@/hooks/useRemoveLiquidity";
import { formatCurrency } from "@/lib/utils";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { MinusIcon } from "lucide-react";
import { useCallback, useState } from "react";

const RemoveLiquidity = () => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const { account } = useWallet();
  const { data: providerBalance } = useProviderBalanceQuery(
    account?.address.toStringLong() || null
  );
  const { mutateAsync } = useRemoveLiquidity({
    amount: String(Number(withdrawAmount) * 1e6),
    address: account?.address.toStringLong() || "",
  });
  const handleWithdraw = useCallback(async () => {
    await mutateAsync().then(() => setWithdrawAmount(""));
  }, [mutateAsync]);

  return (
    <div className="space-y-2">
      <Label htmlFor="withdraw">Withdraw</Label>
      <div className="flex space-x-2">
        <Input
          id="withdraw"
          type="number"
          placeholder="0.00"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <Button
          disabled={!withdrawAmount}
          variant="outline"
          onClick={handleWithdraw}
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
      </div>
      {providerBalance && (
        <div className="text-xs text-muted-foreground">
          Your balance: {formatCurrency(providerBalance?.formatted)}
        </div>
      )}
    </div>
  );
};

export default RemoveLiquidity;
