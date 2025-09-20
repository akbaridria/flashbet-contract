import { Button } from "@/components/ui/button";
import { ZapIcon, InfoIcon, GithubIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import FaucetButton from "./components/faucet-button";
import TooltipButton from "./components/tooltip-button";
import WalletSelector from "./components/wallet-selector";

const Header = () => {
  return (
    <div className="border-b  border-secondary sticky top-0 z-10 bg-background">
      <div className="max-w-[1200px] mx-auto p-4 border-x  border-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZapIcon className="h-6 w-6" />
            <div className="text-xl font-bold">FlashBet</div>
          </div>
          <div className="flex items-center gap-1">
            <FaucetButton />
            <Separator orientation="vertical" className="min-h-4" />
            <TooltipButton
              content="Learn more about FlashBet"
              trigger={
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon">
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </a>
              }
            />
            <Separator orientation="vertical" className="min-h-4" />
            <TooltipButton
              content="View on GitHub"
              trigger={
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon">
                    <GithubIcon className="h-4 w-4" />
                  </Button>
                </a>
              }
            />
            <Separator orientation="vertical" className="min-h-4" />
            <WalletSelector />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
