// components/modals/AssetOwnersModal.tsx
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useWeb3 } from "@/contexts/Web3Context";
import { SalesModal } from "./SalesModal";

interface OwnerBalance {
  address: string;
  balance: number;
}

interface AssetOwnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  assetTokens: number;
  fetchOwnersBalances: (assetId: number) => Promise<OwnerBalance[]>;
  accountBalance: number;
  onBalanceUpdate?: (newBalance: number) => void;
}

export function AssetOwnersModal({
  isOpen,
  onClose,
  assetId,
  assetTokens,
  fetchOwnersBalances,
  accountBalance,
  onBalanceUpdate,
}: AssetOwnersModalProps) {
  const { account } = useWeb3();
  const [owners, setOwners] = useState<OwnerBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salesModalConfig, setSalesModalConfig] = useState<{
    isOpen: boolean;
    mode: "buy" | "sell" | "self-sell" | "auction" | "bid";
    ownerAddress?: string;
    maxTokens: number;
  } | null>(null);

  useEffect(() => {
    const loadOwners = async () => {
      if (!isOpen || assetId <= 0) return;
      console.log("Loading owners for asset:", assetId);

      try {
        setIsLoading(true);
        console.log("loading");
        setError(null);
        console.log("Fetching owners for asset:", assetId);
        const ownersData = await fetchOwnersBalances(assetId);
        console.log("Fetched ownersData:", ownersData);
        setOwners(ownersData.filter((owner) => owner.balance > 0));
      } catch (err) {
        console.error("Error loading owners:", err);
        setError(err instanceof Error ? err.message : "Failed to load owners");
      } finally {
        setIsLoading(false);
      }
    };

    loadOwners();
  }, [isOpen, assetId, fetchOwnersBalances]);

  const handleSale = (ownerAddress: string, ownerBalance: number) => {
    setSalesModalConfig({
      isOpen: true,
      mode:
        ownerAddress.toLowerCase() === account.toLowerCase()
          ? "self-sell"
          : "sell",
      ownerAddress,
      maxTokens: ownerBalance,
    });
  };

  const handlePurchase = (ownerAddress: string, ownerBalance: number) => {
    setSalesModalConfig({
      isOpen: true,
      mode: "buy",
      ownerAddress,
      maxTokens: ownerBalance,
    });
  };

  const handleAuction = (ownerAddress: string, ownerBalance: number) => {
    console.log("handleAuction", ownerAddress, ownerBalance);
    setSalesModalConfig({
      isOpen: true,
      mode: "auction",
      ownerAddress,
      maxTokens: ownerBalance,
    });
  };

  const handleBid = (ownerAddress: string, ownerBalance: number) => {
    console.log("handleBid", ownerAddress, ownerBalance);
    setSalesModalConfig({
      isOpen: true,
      mode: "bid",
      ownerAddress,
      maxTokens: ownerBalance,
    });
  };

  const handleTransactionComplete = async () => {
    const updatedOwners = await fetchOwnersBalances(assetId);
    setOwners(updatedOwners.filter((owner) => owner.balance > 0));

    const currentOwner = updatedOwners.find(
      (owner) => owner.address.toLowerCase() === account.toLowerCase()
    );
    if (currentOwner) {
      onBalanceUpdate?.(currentOwner.balance);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={onClose}
        title={`Token #${assetId} Owners`}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl text-black font-semibold mb-4">
                Asset ID: {assetId}
              </h2>
              {isLoading && (
                <div className="text-center py-4">Loading owners...</div>
              )}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              {!isLoading && !error && owners.length === 0 && (
                <div className="text-center py-4 text-gray-600">
                  No owners found for this token
                </div>
              )}
              {!isLoading && (
                <div>
                  <p className="text-sm text-black mb-4">
                    #{assetTokens} tokens
                  </p>
                  <p className="text-sm text-red-900 mb-4">Owners:</p>
                </div>
              )}
              <div className="space-y-4">
                {!isLoading &&
                  owners.map((owner) => (
                    <div
                      key={owner.address}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-black font-bold">
                          {owner.address.slice(0, 6)}...
                          {owner.address.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Balance:{" "}
                          <span className="text-green-900 font-bold">
                            {owner.balance}
                          </span>{" "}
                          tokens
                        </p>
                      </div>
                      {owner.address.toUpperCase() !==
                        account.toUpperCase() && (
                        <Button
                          onClick={() =>
                            handlePurchase(owner.address, owner.balance)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Buy
                        </Button>
                      )}
                      {accountBalance > 0 && (
                        <Button
                          onClick={() =>
                            handleSale(owner.address, accountBalance)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Sell
                        </Button>
                      )}
                      {owner.address.toUpperCase() ===
                        account.toUpperCase() && (
                        <Button
                          onClick={() => handleAuction(account, accountBalance)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Auction
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="border-t p-4 flex justify-end space-x-4">
              {!isLoading &&
                ((owners.some(
                  (owner) =>
                    owner.address.toLowerCase() === account.toLowerCase()
                ) &&
                  owners?.length > 2) ||
                  (!owners.some(
                    (owner) =>
                      owner.address.toLowerCase() === account.toLowerCase()
                  ) &&
                    owners?.length > 1)) && (
                  <Button
                    onClick={() => handleBid(account, accountBalance)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Bid
                  </Button>
                )}
              <Button
                onClick={onClose}
                variant="secondary"
                className="bg-gray-100 hover:bg-gray-200"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
      {salesModalConfig && (
        <SalesModal
          isOpen={salesModalConfig.isOpen}
          onClose={() => setSalesModalConfig(null)}
          mode={salesModalConfig.mode}
          assetId={assetId}
          maxTokens={salesModalConfig.maxTokens}
          ownerAddress={salesModalConfig.ownerAddress}
          onTransactionComplete={handleTransactionComplete}
        />
      )}
    </>
  );
}
