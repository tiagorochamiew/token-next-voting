// components/AssetGrid.tsx
import { useEffect, useState, useCallback } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useAssets } from "../contexts/AssetsContext";
import { Button } from "@/components/ui/Button";
import { Pages } from "@/enums/Pages";
import AssetCard from "./AssetCard";
import AssetModal from "./AssetModal";

interface AssetGridProps {
  activeTab: string;
}

export default function AssetGrid({ activeTab }: AssetGridProps) {
  const { account } = useWeb3();
  const { assets, isLoading, error, fetchAssets } = useAssets();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAssets(account);
  }, [activeTab, account, fetchAssets]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

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
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Create F-NFT
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === Pages.HOME &&
          assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
      </div>

      <AssetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onMint={function (): Promise<string> {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
}
