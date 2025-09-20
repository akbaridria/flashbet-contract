import { useEffect, useRef } from "react";

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = container.current;

    if (currentContainer) {
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: "PYTH:BTCUSD",
        interval: "1",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: "tradingview_chart",
        hide_volume: false,
        studies: ["STD;SMA"],
        width: "100%",
        height: 450,
      });

      currentContainer.appendChild(script);
    }

    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-full">
      <div ref={container} id="tradingview_chart" className="h-full" />
    </div>
  );
}

export default TradingViewWidget;
