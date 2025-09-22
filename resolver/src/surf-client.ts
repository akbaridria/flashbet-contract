import { createSurfClient } from "@thalalabs/surf";
import { aptosClient } from "./aptos-client";

export const surf = createSurfClient(aptosClient());
