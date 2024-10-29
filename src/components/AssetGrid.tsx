// components/AssetGrid.tsx
import { useEffect, useCallback } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useAssets } from "../contexts/AssetsContext";
import { useSmartContract } from "../contexts/SmartContractContext";
import { Pages } from "@/enums/Pages";
import { HomeTab } from "./tabs/Home";
import { AccountTab } from "./tabs/Account";
import AssetModal from "./FormModal";

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
    if (!isLoading && currentPage !== 1) {
      fetchAssets(account, currentPage - 1);
    }
  }, [account, currentPage, fetchAssets, isLoading]);

  const loadFirstPage = useCallback(() => {
    if (!isLoading && currentPage !== 1) {
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

  if (isLoading && currentPage === 1) {
    return <div className="text-center py-8">Loading assets...</div>;
  }

  if (!account) {
    return (
      <div className="text-center py-8 text-gray-600">
        Please connect your wallet to view assets
      </div>
    );
  }
  let content;

  switch (activeTab) {
    case Pages.HOME:
      content = (
        <HomeTab
          assets={assets}
          isLoading={isLoading}
          hasMore={hasMore}
          currentPage={currentPage}
          loadNextPage={loadNextPage}
          loadPreviousPage={loadPreviousPage}
          loadFirstPage={loadFirstPage}
        />
      );
      break;
    case Pages.ACCOUNT:
      content = <AccountTab />;
      break;
    default:
      content = <div className="text-black">{"Warning: In development"}</div>;
      break;
  }

  return (
    <div>
      {content}
      <AssetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onMint={handleMint}
      />
    </div>
  );
}
