import Header from "./components/header";
import PlaceBet from "./components/place-bet";
import TradingViewWidget from "./components/tradingview-widget";
import { Toaster } from "./components/ui/sonner";
import WrongNetworkAlert from "./components/wrong-network-alert";

const App = () => {
  return (
    <main>
      <Header />
      <div className="max-w-[1200px] mx-auto p-4 min-h-screen border-x border-dashed border-primary space-y-6">
        <div className="bg-secondary border border-primary border-dashed rounded-lg p-6">
          <h1 className="text-xl font-bold mb-2">FlashBet</h1>
          <p className="text-muted-foreground text-sm">
            FlashBet lets you predict whether the{" "}
            <span className="font-bold text-white">Bitcoin (BTC)</span> price
            will go up or down over short time periods. Just choose your
            direction (<span className="font-bold text-white">up</span> or{" "}
            <span className="font-bold text-white">down</span>), choose a time
            period from{" "}
            <span className="font-bold text-white">2 to 10 minutes</span>, and
            bet. You win <span className="font-bold text-white">1.75x</span> if
            you're correct! Fast, simple, and supported by{" "}
            <span className="font-bold text-white">on-chain price feeds</span>{" "}
            (Pyth Network).
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 border border-primary border-dashed rounded-lg pointer-events-none"></div>
          <TradingViewWidget />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlaceBet />
          <div>this is liquidity management</div>
          <div>this is recent activity</div>
        </div>
      </div>
      <Toaster />
      <WrongNetworkAlert />
    </main>
  );
};

export default App;
