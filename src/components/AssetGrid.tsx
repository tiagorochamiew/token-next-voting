// components/AssetGrid.tsx
import { useEffect, useCallback } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useAssets } from "../contexts/AssetsContext";
import { useSmartContract } from "../contexts/SmartContractContext";
import { Button } from "@/components/ui/Button";
import { Pages } from "@/enums/Pages";
import AssetCard from "./AssetCard";
import AssetModal from "./AssetModal";

interface AssetGridProps {
  activeTab: string;
  isModalOpen: boolean;
  setIsModalOpen?: (isOpen: boolean) => void;
}

export default function AssetGrid({
  activeTab,
  isModalOpen,
  setIsModalOpen,
}: AssetGridProps) {
  const { account } = useWeb3();
  const { assets, isLoading, error, fetchAssets, hasMore, currentPage } =
    useAssets();
  const { mintAsset } = useSmartContract();

  useEffect(() => {
    fetchAssets(account, 1);
  }, [activeTab, account, fetchAssets]);

  const loadNextPage = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchAssets(account, currentPage + 1);
    }
  }, [account, hasMore, currentPage, fetchAssets, isLoading]);

  const loadPreviousPage = useCallback(() => {
    if (!isLoading && currentPage != 1) {
      fetchAssets(account, currentPage - 1);
    }
  }, [account, currentPage, fetchAssets, isLoading]);

  const loadFirstPage = useCallback(() => {
    if (!isLoading && currentPage != 1) {
      fetchAssets(account, 1);
    }
  }, [account, currentPage, fetchAssets, isLoading]);

  const handleMint = useCallback(
    async (numTokens: number) => {
      try {
        const { txHash, koltenaId } = await mintAsset(numTokens);
        await fetchAssets(account, 1);
        console.log("Minted asset:", { txHash, koltenaId });
        return { txHash, koltenaId };
      } catch (error) {
        console.error("Minting error:", error);
        throw error;
      }
    },
    [mintAsset, fetchAssets, account]
  );

  const handleModalClose = useCallback(() => {
    if (setIsModalOpen) {
      setIsModalOpen(false);
    }
  }, [setIsModalOpen]);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading assets...</div>;
  }

  if (!account) {
    return (
      <div className="text-center py-8 text-gray-600">
        Please connect your wallet to view assets
      </div>
    );
  }

  return (
    <div>
      {activeTab === Pages.ACCOUNT && (
        <>
          <div className="text-black">{"Warning: In development"}</div>
        </>
      )}
      {activeTab === Pages.HOME && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>

          {isLoading && (
            <div className="text-center py-4">Loading more assets...</div>
          )}

          {!isLoading && currentPage != 1 && (
            <div className="text-center py-4">
              <Button
                onClick={loadPreviousPage}
                variant="secondary"
                className="bg-blue-200 hover:bg-blue-700 text-black"
              >
                Previous
              </Button>
            </div>
          )}

          {!isLoading && hasMore && (
            <div className="text-center py-4">
              <Button
                onClick={loadNextPage}
                variant="secondary"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Load More
              </Button>
            </div>
          )}

          {!isLoading && currentPage != 1 && (
            <div className="text-center py-4">
              <Button
                onClick={loadFirstPage}
                variant="secondary"
                className="bg-red-400 hover:bg-red-500 text-white-300"
              >
                Reset
              </Button>
            </div>
          )}

          {!isLoading && assets.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No assets available
            </div>
          )}
        </>
      )}

      <AssetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onMint={handleMint}
      />
    </div>
  );
}
