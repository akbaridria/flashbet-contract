import { MOCK_USDC_ABI } from "@/abis/mock-usdc";
import { surfClient } from "@/lib/surf";

export async function getMetadataUsdc(): Promise<{ inner: `0x${string}` }> {
  try {
    const [metadata] = await surfClient()
      .useABI(MOCK_USDC_ABI)
      .view.get_metadata({
        functionArguments: [],
        typeArguments: [],
      });
    return metadata;
  } catch (error) {
    console.error("Failed to fetch USDC metadata:", error);
    throw new Error(`Failed to fetch USDC metadata for ${error}`);
  }
}
