// components/modals/AssetOwnersModal.tsx
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useWeb3 } from "@/contexts/Web3Context";

interface OwnerBalance {
  address: string;
  balance: number;
}

interface AssetOwnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  fetchOwnersBalances: (assetId: number) => Promise<OwnerBalance[]>;
}

export function AssetOwnersModal({
  isOpen,
  onClose,
  assetId,
  fetchOwnersBalances,
}: AssetOwnersModalProps) {
  const { account } = useWeb3();
  const [owners, setOwners] = useState<OwnerBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSale = async (ownerAddress: string) => {
    try {
      console.log("Selling token for owner:", ownerAddress);
      //   await handleSaleToken(assetId, ownerAddress);
      const updatedOwners = await fetchOwnersBalances(assetId);
      setOwners(updatedOwners.filter((owner) => owner.balance > 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sell tokens");
    }
  };

  const handlePurchase = async (ownerAddress: string) => {
    try {
      console.log("Purchasing token of owner:", ownerAddress);
      //   await handleSaleToken(assetId, ownerAddress);
      const updatedOwners = await fetchOwnersBalances(assetId);
      setOwners(updatedOwners.filter((owner) => owner.balance > 0));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to purchase tokens"
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title={`Token #${assetId} Owners`}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl text-black font-semibold mb-4">
              Asset #{assetId} Owners
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

            <div className="space-y-4">
              {!isLoading &&
                owners.map((owner) => (
                  <div
                    key={owner.address}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-black font-bold">
                        {owner.address.slice(0, 6)}...{owner.address.slice(-4)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Balance: {owner.balance} tokens
                      </p>
                    </div>
                    {owner.address.toUpperCase() !== account.toUpperCase() && (
                      <Button
                        onClick={() => handlePurchase(owner.address)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Buy
                      </Button>
                    )}
                    {
                      <Button
                        onClick={() => handleSale(owner.address)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Sell
                      </Button>
                    }
                  </div>
                ))}
            </div>
          </div>

          <div className="border-t p-4 flex justify-end">
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
  );
}
