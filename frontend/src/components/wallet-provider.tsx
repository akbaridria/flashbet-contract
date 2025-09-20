import { APTOS_API_KEY, NETWORK } from "@/config/constant";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import type { PropsWithChildren } from "react";

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: NETWORK,
        aptosApiKeys: { [NETWORK]: APTOS_API_KEY },
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
