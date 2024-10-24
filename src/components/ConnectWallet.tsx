// components/ConnectWallet.js
import { useWeb3 } from "../contexts/Web3Context";
import { Button } from "@/components/ui/Button";

export default function ConnectWallet() {
  const { account, connectWallet, isLoading } = useWeb3();

  if (account) {
    return (
      <div className="text-sm font-bold text-red-800">
        Connected: {account.slice(0, 6)}...{account.slice(-4)}
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
