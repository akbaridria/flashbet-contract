import { AptosPriceServiceConnection } from "@pythnetwork/pyth-aptos-js";
import config from "./config";

const hermesClient = new AptosPriceServiceConnection(config.HERMES_CLIENT_URL);

export default hermesClient;
