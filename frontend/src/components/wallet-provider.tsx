import { APTOS_API_KEY, NETWORK } from "@/config/constant";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: NETWORK,
        aptosApiKeys: { [NETWORK]: APTOS_API_KEY },
      }}
      onError={(error) => {
        toast.error(error || "Something went wrong!");
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
