import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { FLASHBET_ABI } from "@/abis/flashbet";
import { aptosClient } from "@/lib/aptos-client";
import { useCallback } from "react";

export function useAddLiquidity({
  amount,
  address,
}: {
  amount: string;
  address: string;
}) {
  const { signAndSubmitTransaction } = useWallet();
  const handleAddingLiquidity = useCallback(async () => {
    const response = await signAndSubmitTransaction({
      sender: address,
      data: {
        function: `${FLASHBET_ABI.address}::${FLASHBET_ABI.name}::add_liquidity`,
        functionArguments: [amount],
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
  }, [address, amount, signAndSubmitTransaction]);
  return useMutation({
    mutationFn: handleAddingLiquidity,
    onError: (error) => {
      toast.error(`Error adding liquidity: ${error}`);
    },
    onSuccess: () => {
      toast.success("Liquidity added successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.balance(address) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.providerBalance(address),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketState() });
    },
  });
}
