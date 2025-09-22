import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  const queryClient = useQueryClient();
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

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const committedTxn = await aptosClient().waitForTransaction({
      transactionHash: response.hash,
      options: {
        waitForIndexer: true,
        checkSuccess: true,
      }
    });

    if (committedTxn.success) {
      queryClient.invalidateQueries({ queryKey: queryKeys.balance(address) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.providerBalance(address),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketState() });
      return committedTxn;
    } else {
      throw new Error("Transaction failed");
    }
  }, [address, amount, queryClient, signAndSubmitTransaction]);

  return useMutation({
    mutationFn: handleAddingLiquidity,
    onError: (error) => {
      toast.error(`Error adding liquidity: ${error}`);
    },
    onSuccess: () => {
      toast.success("Liquidity added successfully");
    },
  });
}
