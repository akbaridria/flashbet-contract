import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_COLORS_BORING_AVATAR } from "@/config/constant";
import {
  APTOS_CONNECT_ACCOUNT_URL,
  isAptosConnectWallet,
  truncateAddress,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import Avatar from "boring-avatars";
import { Check, Copy, User, LogOut } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const ConnectedWallet = () => {
  const { account, connected, disconnect, wallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(async () => {
    if (!account?.address.toStringLong()) return;
    try {
      await navigator.clipboard.writeText(account.address.toStringLong());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied wallet address to clipboard.");
    } catch {
      toast.error("Failed to copy wallet address.");
    }
  }, [account]);
  if (!connected) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <Avatar
            name="asd"
            colors={DEFAULT_COLORS_BORING_AVATAR}
            variant="beam"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56" align="end">
        <div className="flex items-center justify-between px-2 py-1.5 text-sm">
          <div>
            <div>Wallet address</div>
            <div className="font-mono text-xs text-muted-foreground">
              {truncateAddress(account?.address.toStringLong() || "")}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        <DropdownMenuSeparator />

        {wallet && isAptosConnectWallet(wallet) && (
          <DropdownMenuItem className="cursor-pointer">
            <a
              href={APTOS_CONNECT_ACCOUNT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2"
            >
              <User className="mr-2 h-4 w-4" />
              View profile
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={disconnect} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConnectedWallet;
