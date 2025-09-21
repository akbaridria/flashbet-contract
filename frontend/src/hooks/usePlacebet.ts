import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { FLASHBET_ABI } from "@/abis/flashbet";
import { aptosClient } from "@/lib/aptos-client";
import { useCallback } from "react";
import { getPriceUpdateData } from "@/lib/utils";

interface PlaceBetParams {
  isLong: boolean;
  duration: number;
  amount: string;
  address: string;
  slippagePrice: string;
}

export function usePlacebet({
  address,
  isLong,
  amount,
  duration,
  slippagePrice,
}: PlaceBetParams) {
  const { signAndSubmitTransaction } = useWallet();

  const handlePlaceBet = useCallback(async () => {
    const priceUpdates = await getPriceUpdateData();
    const response = await signAndSubmitTransaction({
      data: {
        function: `${FLASHBET_ABI.address}::${FLASHBET_ABI.name}::place_bet`,
        functionArguments: [
          amount,
          duration,
          isLong,
          slippagePrice,
          priceUpdates,
        ],
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
  }, [amount, duration, isLong, signAndSubmitTransaction, slippagePrice]);
  return useMutation({
    mutationFn: handlePlaceBet,
    onError: (error) => {
      toast.error(`Error placing bet: ${error}`);
    },
    onSuccess: () => {
      toast.success("Bet placed successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.balance(address) });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketState() });
    },
  });
}
