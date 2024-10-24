// components/AssetGrid.js
import { useEffect } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useAssets } from "../contexts/AssetsContext";
import AssetCard from "./AssetCard";
import { PageTabs } from "@/enums/PageTabs";
interface AssetGridProps {
  activeTab: string;
}
export default function AssetGrid({ activeTab }: AssetGridProps) {
  const { account } = useWeb3();
  const { assets, isLoading, error, fetchAssets } = useAssets();

  useEffect(() => {
    if (activeTab === PageTabs.ACCOUNT && account) {
      fetchAssets(account);
    } else if (activeTab === PageTabs.HOME) {
      fetchAssets(PageTabs.HOME);
    }
  }, [activeTab, account, fetchAssets]);

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

  if (assets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        {activeTab === PageTabs.ACCOUNT
          ? "No assets found for this wallet"
          : "No assets available"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map((asset) => {
        return <AssetCard key={asset.id} asset={asset} />;
      })}
    </div>
  );
}
