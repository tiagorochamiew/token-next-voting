// components/tabs/Account.tsx
import { useWeb3 } from "@/contexts/Web3Context";
import AssetCard from "@/components/AssetCard";
import { Asset } from "@/interfaces/Asset";

interface AccountTabProps {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
}
export function AccountTab({ assets, isLoading, error }: AccountTabProps) {
  const { account } = useWeb3();

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading your assets...</div>;
  }

  if (!account) {
    return (
      <div className="text-center py-8 text-gray-600">
        Please connect your wallet to view your assets
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Assets</h2>
        <p className="text-gray-600">You dont own any assets yet</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">My Assets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset: Asset) => (
          <div key={asset.id}>
            <AssetCard
              tab="account"
              asset={{
                type: asset.type || "",
                id: asset.id.toString(),
                koltenaId: asset.koltenaId || 0,
                koltenaTokens: asset.koltenaTokens || 0,
                balance: asset.balance || 0,
                title: asset.title || "",
                url: asset.url || "",
                price: asset.price || 0,
                condition: asset.condition || "",
                age: asset.age || "",
                size: asset.size || "",
                liquidity: asset.liquidity || "",
                historicalPerformance: asset.historicalPerformance || [],
                marketTrends: asset.marketTrends || [],
                externalEconomicFactors: asset.externalEconomicFactors || [],
                volatility: asset.volatility || [],
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
