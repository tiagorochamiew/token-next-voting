// components/AssetGrid.js
import { useEffect } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useAssets } from "../contexts/AssetsContext";
import AssetCard from "./AssetCard";

export default function AssetGrid() {
  const { account } = useWeb3();
  const { assets, isLoading, error, fetchAssets } = useAssets();

  useEffect(() => {
    if (account) {
      fetchAssets(account);
    }
  }, [account, fetchAssets]);

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
        No assets found for this wallet
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
