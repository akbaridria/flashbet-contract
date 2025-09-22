import config from "./config";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptos = new Aptos(
  new AptosConfig({
    network: Network.TESTNET,
    clientConfig: { API_KEY: config.APTOS_API_KEY },
  })
);

export function aptosClient() {
  return aptos;
}
