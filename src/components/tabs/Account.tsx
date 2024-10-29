// components/tabs/Account.tsx
import { useEffect, useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSmartContract } from "@/contexts/SmartContractContext";
import AssetCard from "../AssetCard";

interface AccountAsset {
  id: number;
  balance: number;
}

export function AccountTab() {
  const { account } = useWeb3();
  const { fetchAccountBalances, fetchAccountAssets } = useSmartContract();
  const [accountAssets, setAccountAssets] = useState<AccountAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccountAssets = async () => {
      if (!account) return;

      try {
        setIsLoading(true);
        setError("");

        const assetIds = await fetchAccountAssets(account);

        if (assetIds.length > 0) {
          const balances = await fetchAccountBalances(account, assetIds);
          const assets = assetIds.map((id, index) => ({
            id,
            balance: balances[index],
          }));

          setAccountAssets(assets);
        } else {
          setAccountAssets([]);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch account assets";
        setError(message);
        console.error("Error loading account assets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountAssets();
  }, [account, fetchAccountBalances, fetchAccountAssets]);

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

  if (accountAssets.length === 0) {
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
        {accountAssets.map((asset) => (
          <div key={asset.id}>
            <AssetCard
              asset={{
                type: "koltena",
                id: asset.id.toString(),
                koltenaId: asset.id,
                koltenaTokens: asset.balance,
                title: `Asset #${asset.id}`,
                url: "",
                price: 0,
                condition: "",
                age: "",
                size: "",
                liquidity: "",
                historicalPerformance: [],
                marketTrends: [],
                externalEconomicFactors: [],
                volatility: [],
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
