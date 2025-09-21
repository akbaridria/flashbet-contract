/* eslint-disable @typescript-eslint/no-explicit-any */
import { surfClient } from "@/lib/surf";
import { FLASHBET_ABI } from "@/abis/flashbet";

export async function getMarketState(): Promise<[string, string, boolean]> {
  try {
    const result = await surfClient()
      .useABI(FLASHBET_ABI)
      .view.get_market_state({
        functionArguments: [],
        typeArguments: [],
      });
    return result;
  } catch (error) {
    console.error("Failed to fetch market state:", error);
    throw new Error(`Failed to fetch market state for ${error}`);
  }
}

export async function getProviderBalance(address: `0x${string}`): Promise<any> {
  try {
    const result = await surfClient()
      .useABI(FLASHBET_ABI)
      .view.get_provider_liquidity({
        functionArguments: [address],
        typeArguments: [],
      });
    return result;
  } catch (error) {
    console.error("Failed to fetch provider balance:", error);
    throw new Error(
      `Failed to fetch provider balance for ${address}: ${error}`
    );
  }
}

export async function getUserHistory(address: `0x${string}`): Promise<any> {
  try {
    const result = await surfClient()
      .useABI(FLASHBET_ABI)
      .view.get_user_bets({
        functionArguments: [address],
        typeArguments: [],
      });
    return result;
  } catch (error) {
    console.error("Failed to fetch user history:", error);
    throw new Error(`Failed to fetch user history for ${address}: ${error}`);
  }
}

export async function getBetInfo(betId: string): Promise<any> {
  try {
    const result = await surfClient()
      .useABI(FLASHBET_ABI)
      .view.get_bet_info({
        functionArguments: [betId],
        typeArguments: [],
      });
    return result;
  } catch (error) {
    console.error("Failed to fetch bet info:", error);
    throw new Error(`Failed to fetch bet info for ${betId}: ${error}`);
  }
}
