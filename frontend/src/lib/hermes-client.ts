import { HERMEST_CLIENT_URL } from "@/config/constant";
import { AptosPriceServiceConnection } from "@pythnetwork/pyth-aptos-js";

const connection = new AptosPriceServiceConnection(HERMEST_CLIENT_URL);

export default connection;
