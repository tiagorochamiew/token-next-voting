// components/AssetModal.tsx
import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSmartContract } from "@/contexts/SmartContractContext";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Asset } from "@/interfaces/Asset";
import { fetcher } from "@/api/fetcher";

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  koltenaId: number;
}

export default function AssetModal({
  isOpen,
  onClose,
  koltenaId,
}: AssetModalProps) {
  const { account } = useWeb3();
  const { fetchAccountBalances } = useSmartContract();
  const [asset, setAsset] = useState<Asset>();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!koltenaId || !account) return;

      try {
        setIsLoading(true);
        setError("");

        // Fetch asset details from your API
        const assetResponse = await fetcher(`${}s/${koltenaId}`);
        if (!assetResponse?.success || !assetResponse?.data) {
          throw new Error("Failed to fetch asset details");
        }

        setAsset(assetResponse.data);

        // Fetch balance for this specific asset
        const balances = await fetchAccountBalances(account, [koltenaId]);
        setBalance(balances[0]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch asset details";
        setError(message);
        console.error("Error loading asset details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchAssetDetails();
    }
  }, [isOpen, koltenaId, account, fetchAccountBalances]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="min-h-screen py-6 flex flex-col justify-center">
        <Card className="w-full max-w-2xl bg-white mx-auto">
          <CardHeader className="border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Asset Details</h2>
              <Button
                onClick={onClose}
                variant="secondary"
                className="text-gray-600"
              >
                Close
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">Loading asset details...</div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : asset ? (
              <div className="space-y-6">
                <div className="flex items-start space-x-6">
                  {asset.url ? (
                    <img
                      src={asset.url}
                      alt={asset.title}
                      className="w-48 h-48 object-cover rounded"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      {asset.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-blue-800">
                          Your Balance: {balance} tokens
                        </p>
                      </div>
                      <DetailItem label="Koltena ID" value={asset.koltenaId} />
                      <DetailItem
                        label="Total Supply"
                        value={asset.koltenaTokens}
                      />
                      <DetailItem label="Price" value={`$${asset.price}`} />
                      <DetailItem label="Type" value={asset.type} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <DetailItem label="Condition" value={asset.condition} />
                  <DetailItem label="Age" value={asset.age} />
                  <DetailItem label="Size" value={asset.size} />
                  <DetailItem label="Liquidity" value={asset.liquidity} />
                </div>

                <ArrayDetail
                  label="Historical Performance"
                  values={asset.historicalPerformance}
                />
                <ArrayDetail
                  label="Market Trends"
                  values={asset.marketTrends}
                />
                <ArrayDetail
                  label="External Economic Factors"
                  values={asset.externalEconomicFactors}
                />
                <ArrayDetail
                  label="Volatility"
                  values={asset.volatility.map((v) => `${v}%`)}
                />
              </div>
            ) : (
              <div className="text-center py-4 text-gray-600">
                Asset not found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

function ArrayDetail({
  label,
  values,
}: {
  label: string;
  values: (string | number)[];
}) {
  if (!values?.length) return null;

  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
      <ul className="list-disc list-inside space-y-1">
        {values.map((value, index) => (
          <li key={index} className="text-sm">
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}
