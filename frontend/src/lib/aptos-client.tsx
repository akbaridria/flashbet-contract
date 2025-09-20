import { APTOS_API_KEY, NETWORK } from "@/config/constant";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

const aptos = new Aptos(
  new AptosConfig({
    network: NETWORK,
    clientConfig: { API_KEY: APTOS_API_KEY },
  })
);

export function aptosClient() {
  return aptos;
}
