import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BTC_PRICE_FEED_ID, FLASHBET_API } from "@/config/constant";
import connection from "./hermes-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value?: number | string) {
  if (value === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export async function getPriceUpdateData() {
  return await connection.getPriceFeedsUpdateData([BTC_PRICE_FEED_ID]);
}

export const getBtcPrice = async () => {
  const priceIds = [BTC_PRICE_FEED_ID];
  const latestPriceFeeds = await connection.getLatestPriceFeeds(priceIds);
  const price = latestPriceFeeds?.[0]?.getEmaPriceNoOlderThan(60);
  return price;
};

export const pushBetToQueue = async ({
  betId,
  betDuration,
}: {
  betId: number;
  betDuration: number;
}) => {
  fetch(FLASHBET_API + "/add-job", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      betId: betId,
      expiryTime: betDuration,
    }),
  });
};
