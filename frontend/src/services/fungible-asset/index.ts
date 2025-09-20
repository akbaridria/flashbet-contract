import { PRIMARY_FUNGIBLE_STORE_ABI } from "@/abis/fungible-asset";
import { surfClient } from "@/lib/surf";
import { getMetadataUsdc } from "../mock-usdc";

export async function getFungibleAssetBalance(
  address: `0x${string}`
): Promise<string> {
  try {
    const metadata = await getMetadataUsdc();
    const [balance] = await surfClient()
      .useABI(PRIMARY_FUNGIBLE_STORE_ABI)
      .view.balance({
        functionArguments: [address, metadata.inner],
        typeArguments: ["0x1::object::ObjectCore"],
      });
    return balance;
  } catch (error) {
    console.error("Failed to fetch fungible asset balance:", error);
    throw new Error(`Failed to fetch FA balance for ${error}`);
  }
}
