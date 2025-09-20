"use client";

import { formatCurrency, getBtcPrice } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";

const DEFAULT_COUNTDOWN = 60;

const CurrentBtcPrice = () => {
  const [price, setPrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(DEFAULT_COUNTDOWN);
  const [, setLastFetch] = useState<number>(0);

  const fetchPrice = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBtcPrice();
      const rawPrice = data?.parsed?.[0]?.price?.price;
      const actualPrice =
        Number(rawPrice) * Math.pow(10, data?.parsed?.[0]?.price?.expo || 0);
      const formattedPrice = formatCurrency(actualPrice);
      setPrice(formattedPrice || null);
      setLastFetch(Date.now());
      setCountdown(DEFAULT_COUNTDOWN);
    } catch (error) {
      console.error("Failed to fetch BTC price:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchPrice();
          return DEFAULT_COUNTDOWN;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchPrice]);

  const progressPercentage = ((DEFAULT_COUNTDOWN - countdown) / DEFAULT_COUNTDOWN) * 100;
  const circumference = 2 * Math.PI * 8;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">Current BTC Price</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{price || "Loading..."}</span>
        <div className="relative w-6 h-6">
          <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 20 20">
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-muted-foreground/20"
            />

            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ease-linear ${
                isLoading ? "text-orange-500" : "text-green-500"
              }`}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-mono text-muted-foreground">
              {isLoading ? "..." : countdown}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentBtcPrice;
