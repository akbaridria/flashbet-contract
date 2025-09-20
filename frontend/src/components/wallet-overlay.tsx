import type React from "react";
import { Wallet } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface WalletOverlayProps {
  children: React.ReactNode;
  description?: string;
}

const WalletOverlay: React.FC<WalletOverlayProps> = ({
  children,
  description = "Connect your wallet to view activity",
}) => {
  const { connected } = useWallet();

  if (connected) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none h-full">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center  border border-secondary  bg-background/80 backdrop-blur-sm rounded-lg">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Wallet Connection Required</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletOverlay;
