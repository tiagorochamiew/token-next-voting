// components/AssetGrid.tsx
import { useEffect, useCallback, useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useAssets } from "@/contexts/AssetsContext";
import { useSmartContract } from "@/contexts/SmartContractContext";
import { Pages } from "@/enums/Pages";
import { HomeTab } from "@/components/tabs/Home";
import { AccountTab } from "@/components/tabs/Account";
import AssetModal from "@/components/modals/FormModal";
import { Asset } from "@/interfaces/Asset";
import apiConfig from "@/lib/config";

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
  const { fetchAccountBalances, fetchAccountAssets, mintAsset } =
    useSmartContract();
  const [accountAssets, setAccountAssets] = useState<Asset[]>([]);

  const loadAccountAssets = useCallback(async () => {
    if (!account) return null;

    try {
      const assetIds = await fetchAccountAssets(account);
      if (assetIds.length <= 0) {
        return [];
      }

      const balances = await fetchAccountBalances(account, assetIds);
      const accountBalances = assetIds.map((id, index) => ({
        id,
        balance: balances[index],
      }));
      console.log("Fetching...");
      const response = await fetch(`${apiConfig.apiUrl}/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          balances: accountBalances.map((item) => ({
            id: item.id,
            balance: item.balance,
          })),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch asset details from backend");
      }
      console.log("Fetched koltena assets");

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch asset details");
      }

      return data.data;
    } catch (err) {
      console.error("Error loading account assets:", err);
      throw err;
    }
  }, [account, fetchAccountAssets, fetchAccountBalances]);
  useEffect(() => {
    const loadAssets = async () => {
      if (activeTab === Pages.HOME) {
        fetchAssets(account, 1);
      }
      if (activeTab === Pages.ACCOUNT) {
        const data = await loadAccountAssets();
        setAccountAssets(data);
      }
    };

    loadAssets();
  }, [activeTab, account, fetchAssets, loadAccountAssets]);

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
      content = (
        <AccountTab
          assets={accountAssets}
          isLoading={isLoading}
          error={error}
        />
      );
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
