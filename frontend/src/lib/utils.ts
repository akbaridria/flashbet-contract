import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HermesClient } from "@pythnetwork/hermes-client";
import { BTC_PRICE_FEED_ID, HERMEST_CLIENT_URL } from "@/config/constant";

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

export const getBtcPrice = async () => {
  const connection = new HermesClient(HERMEST_CLIENT_URL);
  const priceIds = [BTC_PRICE_FEED_ID];
  return await connection.getLatestPriceUpdates(priceIds, {
    parsed: true,
  });
};
