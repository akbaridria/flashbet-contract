import { Worker } from "bullmq";
import IORedis from "ioredis";
import config from "./config";
import { surf } from "./surf-client";
import { FLASHBET_ABI } from "./abi";
import hermesClient from "./herme-client";
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });

interface BetJobData {
  betId: number | string;
}

const getPriceFeedsData = async () => {
  const priceFeedIds = [config.BTC_PRICE_FEED_ID];
  const priceFeedData = await hermesClient.getPriceFeedsUpdateData(
    priceFeedIds
  );
  return priceFeedData;
};

const worker = new Worker<BetJobData>(
  config.QUEUE_NAME,
  async (job) => {
    console.log(`Processing job with ID ${job.id} and data:`, job.data);
    const account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(config.PRIVATE_KEY),
    });
    const data = await getPriceFeedsData();
    surf.useABI(FLASHBET_ABI).entry.resolve_bet({
      account,
      functionArguments: [job.data.betId, data],
      typeArguments: [],
    });
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job with ID ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`Job with ID ${job?.id} failed with error: ${err.message}`);
});
