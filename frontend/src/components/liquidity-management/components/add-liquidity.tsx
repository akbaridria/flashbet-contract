import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddLiquidity } from "@/hooks/useAddLiquidity";
import { useBalanceQuery } from "@/hooks/useBalance";
import { formatCurrency } from "@/lib/utils";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";

const AddLiquidity = () => {
  const [liquidityAmount, setLiquidityAmount] = useState("");
  const { account } = useWallet();
  const { data: balance } = useBalanceQuery(
    account?.address.toStringLong() || null
  );
  const { mutateAsync } = useAddLiquidity({
    amount: String(Number(liquidityAmount) * 1e6),
    address: account?.address.toStringLong() || "",
  });

  const handleAddLiquidity = useCallback(async () => {
    await mutateAsync().then(() => setLiquidityAmount(""));
  }, [mutateAsync]);

  return (
    <div className="space-y-2">
      <Label htmlFor="liquidity">Add Liquidity</Label>
      <div className="flex space-x-2">
        <Input
          id="liquidity"
          type="number"
          placeholder="0.00"
          value={liquidityAmount}
          onChange={(e) => setLiquidityAmount(e.target.value)}
        />
        <Button disabled={!liquidityAmount} onClick={handleAddLiquidity}>
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      {balance && (
        <div className="text-xs text-muted-foreground">
          Your balance: {formatCurrency(balance?.formatted)}
        </div>
      )}
    </div>
  );
};

export default AddLiquidity;
