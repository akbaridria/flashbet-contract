import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { FLASHBET_ABI } from "@/abis/flashbet";
import { aptosClient } from "@/lib/aptos-client";
import { useCallback } from "react";
import { getPriceUpdateData, pushBetToQueue } from "@/lib/utils";

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
  const queryClient = useQueryClient();

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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const committedTxn = await aptosClient().waitForTransaction({
      transactionHash: response.hash,
      options: {
        waitForIndexer: true,
        checkSuccess: true,
      },
    });

    if (committedTxn.success) {
      queryClient.invalidateQueries({ queryKey: queryKeys.balance(address) });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketState() });
      if ("events" in committedTxn) {
        committedTxn.events.forEach((event) => {
          if (
            event.type === `${FLASHBET_ABI.address}::events::PlacedBetEvent`
          ) {
            const betId = event.data.bet_id;
            const bet_expirytime = event.data.expiry_time;
            pushBetToQueue({
              betId: Number(betId),
              betDuration: Number(bet_expirytime),
            });
          }
        });
      }
      return committedTxn;
    } else {
      throw new Error("Transaction failed");
    }
  }, [
    address,
    amount,
    duration,
    isLong,
    queryClient,
    signAndSubmitTransaction,
    slippagePrice,
  ]);

  return useMutation({
    mutationFn: handlePlaceBet,
    onError: (error) => {
      toast.error(`Error placing bet: ${error}`);
    },
    onSuccess: () => {
      toast.success("Bet placed successfully");
    },
  });
}
