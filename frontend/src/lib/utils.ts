import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HermesClient } from "@pythnetwork/hermes-client";
import { BTC_PRICE_FEED_ID, HERMEST_CLIENT_URL } from "@/config/constant";
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
  return await connection.getPriceFeedsUpdateData(['0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b']);
}

export function getHermesClient() {
  return new HermesClient(HERMEST_CLIENT_URL);
}

export const getBtcPrice = async () => {
  const connection = getHermesClient();
  const priceIds = [BTC_PRICE_FEED_ID];
  return await connection.getLatestPriceUpdates(priceIds, {
    parsed: true,
  });
};
