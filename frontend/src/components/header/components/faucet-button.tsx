import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import TooltipButton from "./tooltip-button";
import { Button } from "@/components/ui/button";
import { DropletsIcon } from "lucide-react";
import { useFaucet } from "@/hooks/useFaucet";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useCallback, useState } from "react";

const FaucetButton = () => {
  const [open, setOpen] = useState(false);
  const { account } = useWallet();
  const { mutateAsync, isPending } = useFaucet({
    address: account?.address?.toStringLong() || "",
  });
  const handleMint = useCallback(async () => {
    await mutateAsync().then(() => {
      setOpen(false);
    });
  }, [mutateAsync]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <TooltipButton
          content="Get USDC from the faucet"
          trigger={
            <Button variant="ghost">
              <DropletsIcon className="h-4 w-4" />
              <div>Faucet</div>
            </Button>
          }
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto mb-6">
            <DropletsIcon className="h-12 w-12" />
          </div>
          <DialogTitle>Claim Testnet USDC</DialogTitle>
          <DialogDescription>
            Receive 100 USDC testnet tokens to use on FlashBet. These tokens are
            for testing only and work exclusively on the Aptos testnet.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              disabled={isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleMint} className="flex-1" disabled={isPending}>
            Receive 100 USDC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FaucetButton;
