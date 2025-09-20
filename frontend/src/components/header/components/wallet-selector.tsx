import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AboutAptosConnect,
  AptosPrivacyPolicy,
  groupAndSortWallets,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import renderEducationScreen from "./render-education-screen";
import { AptosConnectWalletRow, WalletRow } from "./wallet-row";
import ConnectedWallet from "./connected-wallet";

const WalletSelector = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { wallets = [], notDetectedWallets = [], connected } = useWallet();
  const { aptosConnectWallets, availableWallets, installableWallets } =
    groupAndSortWallets([...wallets, ...notDetectedWallets]);

  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  if (connected) return <ConnectedWallet />;
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Connect a Wallet</Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-auto">
        <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
          <DialogHeader>
            <DialogTitle className="flex flex-col text-center leading-snug">
              {hasAptosConnectWallets ? (
                <>
                  <span>Log in or sign up</span>
                  <span>with Social + Aptos Connect</span>
                </>
              ) : (
                "Connect Wallet"
              )}
            </DialogTitle>
          </DialogHeader>

          {hasAptosConnectWallets && (
            <div className="flex flex-col gap-2 pt-3">
              {aptosConnectWallets.map((wallet) => (
                <AptosConnectWalletRow
                  key={wallet.name}
                  wallet={wallet}
                  onConnect={close}
                />
              ))}
              <p className="flex gap-1 justify-center items-center text-muted-foreground text-sm">
                Learn more about{" "}
                <AboutAptosConnect.Trigger className="flex gap-1 py-3 items-center text-foreground">
                  Aptos Connect <ArrowRight size={16} />
                </AboutAptosConnect.Trigger>
              </p>
              <AptosPrivacyPolicy className="flex flex-col items-center py-1">
                <p className="text-xs leading-5">
                  <AptosPrivacyPolicy.Disclaimer />{" "}
                  <AptosPrivacyPolicy.Link className="text-muted-foreground underline underline-offset-4" />
                  <span className="text-muted-foreground">.</span>
                </p>
                <AptosPrivacyPolicy.PoweredBy className="flex gap-1.5 items-center text-xs leading-5 text-muted-foreground" />
              </AptosPrivacyPolicy>
              <div className="flex items-center gap-3 pt-4 text-muted-foreground">
                <div className="h-px w-full bg-secondary" />
                Or
                <div className="h-px w-full bg-secondary" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-3">
            {availableWallets.map((wallet) => (
              <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
            ))}
            {!!installableWallets.length && (
              <Collapsible className="flex flex-col gap-3">
                <CollapsibleTrigger asChild>
                  <Button size="sm" variant="ghost" className="gap-2">
                    More wallets <ChevronDown />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-3">
                  {installableWallets.map((wallet) => (
                    <WalletRow
                      key={wallet.name}
                      wallet={wallet}
                      onConnect={close}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </AboutAptosConnect>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelector;
