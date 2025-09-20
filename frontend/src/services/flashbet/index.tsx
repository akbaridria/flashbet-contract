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

export async function getProviderBalance(
  address: `0x${string}`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
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
