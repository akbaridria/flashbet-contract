import dotenv from "dotenv";

dotenv.config();

const config = {
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  QUEUE_NAME: "betQueue",
  HERMES_CLIENT_URL: "https://hermes-beta.pyth.network",
  BTC_PRICE_FEED_ID:
    "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  APTOS_API_KEY: process.env.APTOS_API_KEY || "",
  FLASHBET_CONTRACT_ADDRESS: '0xab113bc33b4376ec543703c357d821eae860e447353bed8efb2e84ef6045958e',
};

export default config;