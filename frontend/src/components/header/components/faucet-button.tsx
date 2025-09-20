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
import TooltipButton from "./tooltip-button";
import { Button } from "@/components/ui/button";
import { DropletsIcon } from "lucide-react";

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
          <AlertDialogTitle>Claim Testnet USDC</AlertDialogTitle>
          <AlertDialogDescription>
            Receive 100 testnet USDC to use on FlashBet. These tokens are for
            testing only and work exclusively on the Aptos testnet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClaim}>
            Receive 100 USDC
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FaucetButton;
