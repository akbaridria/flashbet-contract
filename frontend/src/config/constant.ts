import { Network } from "@aptos-labs/ts-sdk";

export const NETWORK = Network.TESTNET;

export const APTOS_API_KEY = import.meta.env.VITE_APTOS_API_KEY;

export const DEFAULT_COLORS_BORING_AVATAR = [
  "#92A1C6",
  "#146A7C",
  "#F0AB3D",
  "#C271B4",
  "#C20D90",
];

export const HERMEST_CLIENT_URL = "https://hermes.pyth.network";

export const BTC_PRICE_FEED_ID =
  "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";

export const DURATION_OPTIONS = [
  { label: "2m", value: 60 * 2 },
  { label: "3m", value: 60 * 3 },
  { label: "5m", value: 60 * 5 },
  { label: "10m", value: 60 * 10 },
];
