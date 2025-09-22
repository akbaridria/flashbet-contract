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

export const BTC_PRICE_FEED_ID =
  "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b";

export const DURATION_OPTIONS = [
  { label: "2m", value: 60 * 2 },
  { label: "3m", value: 60 * 3 },
  { label: "5m", value: 60 * 5 },
  { label: "10m", value: 60 * 10 },
];

export const HERMEST_CLIENT_URL = "https://hermes-beta.pyth.network";

export const FLASHBET_API = import.meta.env.VITE_FLASHBET_API || "http://localhost:8080";