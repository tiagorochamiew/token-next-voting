// components/ConnectWallet.tsx
import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/Button";
import WalletModal from "@/components/modals/WalletModal";

interface ConnectWalletProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

export default function ConnectWallet({ setIsModalOpen }: ConnectWalletProps) {
  const { account, connectWallet, isLoading } = useWeb3();
  const [isOpen, setIsOpen] = useState(false);

  if (!account) {
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

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-800 hover:bg-blue-700 text-sm font-bold text-white flex items-center"
        variant="secondary"
      >
        Account: {account.slice(0, 6)}...{account.slice(-4)}
      </Button>

      {isOpen && (
        <WalletModal setIsOpen={setIsOpen} setIsModalOpen={setIsModalOpen} />
      )}
    </div>
  );
}
