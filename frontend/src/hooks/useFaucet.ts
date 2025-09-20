import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { FLASHBET_ABI } from "@/abis/flashbet";
import { aptosClient } from "@/lib/aptos-client";
import { useCallback } from "react";

export function useFaucet({ address }: { address: string }) {
  const { signAndSubmitTransaction } = useWallet();
  const handleAddingLiquidity = useCallback(async () => {
    const response = await signAndSubmitTransaction({
      sender: address,
      data: {
        function: `${FLASHBET_ABI.address}::${FLASHBET_ABI.name}::mint_usdc`,
        functionArguments: [],
        typeArguments: [],
      },
    });

    const committedTxn = await aptosClient().waitForTransaction({
      transactionHash: response.hash,
    });

    if (committedTxn.success) {
      return committedTxn;
    } else {
      throw new Error("Transaction failed");
    }
  }, [address, signAndSubmitTransaction]);
  return useMutation({
    mutationFn: handleAddingLiquidity,
    onError: (error) => {
      toast.error(`Error minting usdc: ${error}`);
    },
    onSuccess: () => {
      toast.success("Reveived 100 USDC successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.balance(address) });
    },
  });
}
