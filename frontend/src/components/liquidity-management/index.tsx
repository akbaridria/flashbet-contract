import WalletOverlay from "../wallet-overlay";
import { Separator } from "../ui/separator";
import { useProviderBalanceQuery } from "@/hooks/useProviderBalance";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { formatCurrency } from "@/lib/utils";
import AddLiquidity from "./components/add-liquidity";
import RemoveLiquidity from "./components/remove-liquidity";

const LiquidityManagement = () => {
  const { account } = useWallet();
  const { data: providerBalance } = useProviderBalanceQuery(
    account?.address.toStringLong() || null
  );

  return (
    <WalletOverlay description="Connect your wallet to manage liquidity">
      <div className="p-4 bg-card rounded-lg border border-secondary space-y-4">
        <div>
          <div className="text-lg font-semibold">Your Liquidity</div>
          <div className="text-xs text-muted-foreground">
            Manage your liquidity positions
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {providerBalance?.formatted
              ? formatCurrency(providerBalance.formatted)
              : 0}
            <sub className="text-xs">USDC</sub>
          </div>
          <p className="text-xs text-muted-foreground">Your liquidity</p>
        </div>

        <AddLiquidity />
        <Separator />
        <RemoveLiquidity />
      </div>
    </WalletOverlay>
  );
};

export default LiquidityManagement;
