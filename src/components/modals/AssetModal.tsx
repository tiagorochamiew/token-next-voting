// components/AssetModal.tsx
import { useState, useEffect } from "react";
import Image from "next/image";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSmartContract } from "@/contexts/SmartContractContext";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Asset } from "@/interfaces/Asset";
import { DetailItem } from "../details/Item";
import { ArrayDetail } from "../details/Array";

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export default function AssetModal({
  isOpen,
  onClose,
  asset,
}: AssetModalProps) {
  const { account } = useWeb3();
  const { fetchAccountBalance } = useSmartContract();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!asset || !account) return;

      try {
        setIsLoading(true);
        setError("");

        const balance = await fetchAccountBalance(account, asset.koltenaId);
        setBalance(Number(balance));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch balance";
        setError(message);
        console.error("Error loading balance:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && asset && account) {
      fetchBalance();
    }
  }, [isOpen, asset, account, fetchAccountBalance]);

  if (!isOpen || !asset) return null;

  const handleImageError = () => {
    console.error("Error loading image:", asset.url);
    setImageError(true);
  };

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
            ) : (
              <div className="space-y-6">
                {/* Asset Image */}
                <div className="flex items-start space-x-6">
                  <div className="relative w-48 h-48">
                    {asset.url && !imageError ? (
                      <Image
                        src={asset.url}
                        alt={asset.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded"
                        onError={handleImageError}
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      {asset.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {account && (
                        <div className="col-span-2 bg-blue-50 p-3 rounded">
                          <p className="text-sm font-medium text-blue-800">
                            Your Balance: {balance} tokens
                          </p>
                        </div>
                      )}
                      <DetailItem label="Koltena ID" value={asset.koltenaId} />
                      <DetailItem
                        label="Total Supply"
                        value={asset.koltenaTokens}
                      />
                      <DetailItem label="Price" value={`€${asset.price}`} />
                      <DetailItem label="Type" value={asset.type} />
                    </div>
                  </div>
                </div>

                {/* Asset Details */}
                <div className="grid grid-cols-2 gap-6">
                  <DetailItem label="Condition" value={asset.condition} />
                  <DetailItem label="Age" value={asset.age} />
                  <DetailItem label="Size" value={asset.size} />
                  <DetailItem label="Liquidity" value={asset.liquidity} />
                </div>

                {/* Lists */}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
