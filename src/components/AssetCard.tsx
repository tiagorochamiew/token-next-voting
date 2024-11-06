// components/AssetCard.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { ImageModal } from "@/components/modals/ImageModal";
import { AssetOwnersModal } from "@/components/modals/AssetOwnersModal";
import { Asset } from "@/interfaces/Asset";
import { useSmartContract } from "@/contexts/SmartContractContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { AssetTransactionsModal } from "./modals/AssetTransactionsModal";

interface AssetCardProps {
  tab: string;
  asset: Asset;
  onTitleClick?: (koltenaId: number) => void;
}

export default function AssetCard({
  tab,
  asset,
  onTitleClick,
}: AssetCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAssetOwnersModalOpen, setIsAssetOwnersModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(
    asset.balance || 0
  );
  const { fetchAssetOwners, fetchBalancesOfAccounts } = useSmartContract();
  const { account } = useWeb3();

  const ImageFallback = () => (
    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded">
      <span className="text-gray-400">No Image</span>
    </div>
  );

  const handleImageError = () => {
    console.error("Error loading image:", asset.url);
    setImageError(true);
  };

  useEffect(() => {
    const loadCurrentBalance = async () => {
      if (tab === "account" && account) {
        try {
          const balances = await fetchBalancesOfAccounts(
            [account],
            [asset.koltenaId]
          );
          setCurrentBalance(Number(balances[0] || 0));
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    loadCurrentBalance();
  }, [tab, asset.koltenaId, account, fetchBalancesOfAccounts]);

  const fetchOwnersBalances = async (
    assetId: number
  ): Promise<{ address: string; balance: number }[]> => {
    if (!assetId || assetId <= 0) {
      return [];
    }
    try {
      const owners = await fetchAssetOwners(assetId);
      if (!owners || owners.length === 0) {
        return [];
      }

      const assetIds = new Array(owners.length).fill(assetId);
      const balances = await fetchBalancesOfAccounts(
        owners.map((owner) => owner.toString()),
        assetIds
      );

      const currentAccountIndex = owners.findIndex(
        (owner) => owner.toLowerCase() === account.toLowerCase()
      );
      if (currentAccountIndex !== -1) {
        setCurrentBalance(Number(balances[currentAccountIndex] || 0));
      }

      return owners.map((address, index) => ({
        address: address.toString(),
        balance: Number(balances[index] || 0),
      }));
    } catch (error) {
      console.error("Error fetching balances:", error);
      throw new Error("Failed to fetch owner balances");
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <h1 className="text-sm text-black">{asset.type}</h1>
          <h3
            className="text-lg font-semibold text-blue-800 cursor-pointer hover:text-blue-600"
            onClick={() => onTitleClick?.(asset.koltenaId)}
          >
            {asset.title}
          </h3>
        </CardHeader>
        <CardContent className="p-4">
          <div
            className="relative w-full aspect-[4/3] cursor-pointer group"
            onClick={() => !imageError && setIsImageModalOpen(true)}
          >
            {asset.url &&
            asset.url !== "" &&
            asset.url !== "string" &&
            !imageError ? (
              <>
                <Image
                  src={asset.url}
                  alt={asset.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded transition-transform duration-200 group-hover:scale-105"
                  onError={handleImageError}
                  loading="eager"
                  priority
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
                    View Image
                  </span>
                </div>
              </>
            ) : (
              <ImageFallback />
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>ID: {asset.koltenaId}</p>
              <p>#{tab == "home" ? asset.koltenaTokens : currentBalance}</p>
            </div>
            <div className="space-x-2">
              {asset.koltenaId > 0 && (
                <Button
                  onClick={() => setIsTransactionsModalOpen(true)}
                  variant="secondary"
                  className="text-sm bg-gray-100 hover:bg-gray-200"
                >
                  Transactions
                </Button>
              )}
              {asset.koltenaId > 0 && (
                <Button
                  onClick={() => setIsAssetOwnersModalOpen(true)}
                  variant="secondary"
                  className="text-sm bg-gray-100 hover:bg-gray-200"
                >
                  Owners
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ImageModal
        src={asset.url}
        alt={asset.title}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />

      <AssetOwnersModal
        isOpen={isAssetOwnersModalOpen}
        onClose={() => setIsAssetOwnersModalOpen(false)}
        assetId={asset.koltenaId}
        assetTokens={asset.koltenaTokens}
        fetchOwnersBalances={fetchOwnersBalances}
        accountBalance={currentBalance}
        onBalanceUpdate={(newBalance) => setCurrentBalance(newBalance)}
      />

      <AssetTransactionsModal
        isOpen={isTransactionsModalOpen}
        onClose={() => setIsTransactionsModalOpen(false)}
        assetId={asset.koltenaId}
      />
    </>
  );
}
