import { Button } from "./ui/button";
import { ZapIcon, InfoIcon, GithubIcon, DropletsIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "./ui/separator";

interface ToolTipButtonProps {
  content: string;
  trigger: React.ReactNode;
}
const TooltipButton: React.FC<ToolTipButtonProps> = ({ content, trigger }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
};

const FaucetButton = () => {
  const onClaim = () => {};
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <TooltipButton
          content="Get USDC from the faucet"
          trigger={
            <Button variant="ghost">
              <DropletsIcon className="h-4 w-4" />
              <div>Faucet</div>
            </Button>
          }
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Get USDC from the faucet</AlertDialogTitle>
          <AlertDialogDescription>
            Get USDC from the faucet to use in FlashBet. This is a testnet
            faucet, so the USDC you receive is not real and can only be used on
            aptos testnet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClaim}>
            Claim (100 USDC)
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const Header = () => {
  return (
    <div className="border-b border-dashed border-primary sticky top-0 bg-background">
      <div className="max-w-[1200px] mx-auto p-4 border-x border-dashed border-primary">
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
            <Button>Connect Wallet</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
