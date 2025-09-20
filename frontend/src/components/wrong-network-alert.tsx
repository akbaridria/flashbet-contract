import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NETWORK } from "@/config/constant";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AlertTriangle, Wifi } from "lucide-react";

export default function WrongNetworkAlert() {
  const { network, connected } = useWallet();

  if (!connected || network?.name === NETWORK) return null;
  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md border-destructive/20 bg-card"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>

          <DialogTitle className="text-2xl font-semibold text-foreground">
            Wrong Network
          </DialogTitle>

          <DialogDescription className="text-base text-muted-foreground leading-relaxed">
            Your wallet is currently on{" "}
            <span className="font-semibold text-foreground">
              {network?.name || "an unsupported network"}
            </span>
            . Please switch to{" "}
            <span className="font-semibold text-foreground">{NETWORK}</span> to
            continue using the app.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center mt-6 p-4 bg-muted/50 rounded-lg">
          <Wifi className="w-5 h-5 text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">
            Waiting for network switch...
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
