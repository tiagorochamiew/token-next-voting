// components/modals/AssetTransactionsModal.tsx
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSmartContract } from "@/contexts/SmartContractContext";
import { SaleRequest } from "@/interfaces/Events";
import { parseTransactionLogs } from "@/utils/Parser";

interface AssetTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
}

export function AssetTransactionsModal({
  isOpen,
  onClose,
  assetId,
}: AssetTransactionsModalProps) {
  const { account } = useWeb3();
  const { fetchSaleRequests } = useSmartContract();
  const [transactions, setTransactions] = useState<SaleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!isOpen || !assetId) return;

      try {
        setIsLoading(true);
        setError(null);
        const saleRequests = await fetchSaleRequests();
        const logs = parseTransactionLogs(saleRequests);
        const txs = (await logs).filter(
          (tx: SaleRequest) => tx.assetId === assetId
        );
        console.log("Fetched transactions:", txs.length);
        setTransactions(txs);
      } catch (err) {
        console.error("Error loading transactions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load transactions"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [isOpen, assetId, fetchSaleRequests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "proposed":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionStatus = (tx: SaleRequest): string => {
    if (tx.isFinished) return "completed";
    if (tx.isConfirmed) return "confirmed";
    if (tx.bySeller && tx.byBuyer) return "approved";
    if (tx.bySeller) return "seller approved";
    if (tx.byBuyer) return "buyer proposed";
    return "proposed";
  };

  const getTransactionType = (
    tx: SaleRequest,
    currentAccount: string
  ): string => {
    if (tx.seller.toLowerCase() === currentAccount.toLowerCase()) return "SELL";
    if (tx.buyer.toLowerCase() === currentAccount.toLowerCase()) return "BUY";
    return "OTHER";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title={`Asset #${assetId} Transactions`}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

            {isLoading && (
              <div className="text-center py-4">Loading transactions...</div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {!isLoading && transactions.length === 0 && (
              <div className="text-center py-4 text-green-600">
                No transactions found for this asset
              </div>
            )}

            <div className="space-y-4 overflow-y-auto max-h-[50vh]">
              {transactions.map((tx, index) => (
                <div
                  key={`${tx.seller}_${tx.buyer}_${tx.assetId}_${index}`}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-sm font-medium text-black ${getStatusColor(
                          getTransactionStatus(tx)
                        )}`}
                      >
                        {getTransactionStatus(tx)}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium text-black ${
                        getTransactionType(tx, account) === "BUY"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {getTransactionType(tx, account)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-600">Seller</p>
                      {tx.seller.toLowerCase() === account.toLowerCase() && (
                        <p className="font-medium text-black truncate">
                          {`${tx.seller.slice(0, 6)}...${tx.seller.slice(-4)}`}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-green-600">Buyer</p>
                      <p className="font-medium text-black truncate">
                        {tx.buyer.toLowerCase() === account.toLowerCase()
                          ? "You"
                          : `${tx.buyer.slice(0, 6)}...${tx.buyer.slice(-4)}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600">Tokens</p>
                      <p className="font-medium text-black">{tx.tokens}</p>
                    </div>
                    <div>
                      <p className="text-green-600">Price</p>
                      <p className="font-medium text-black">{tx.funds} ETH</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t p-4 flex justify-end">
            <Button
              onClick={onClose}
              variant="secondary"
              className="bg-gray-100 hover:bg-gray-200"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
