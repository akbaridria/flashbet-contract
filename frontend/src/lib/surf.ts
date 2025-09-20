import { createSurfClient } from "@thalalabs/surf";
import { aptosClient } from "./aptos-client";

const surf = createSurfClient(aptosClient());

export function surfClient() {
  return surf;
}
