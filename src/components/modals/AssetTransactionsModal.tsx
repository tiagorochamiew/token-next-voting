// components/modals/AssetTransactionsModal.tsx
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useWeb3 } from "@/contexts/Web3Context";
// import { useSmartContract } from "@/contexts/SmartContractContext";
import { GETResponse } from "@/interfaces/Response";
import { fetcher } from "@/api/fetcher";
import { Transaction } from "@/interfaces/Transaction";
import { TransactionStates } from "@/enums/TransactionStates";
import { Collapsible } from "@/components/ui/Collapsible";

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
  // const { fetchSaleRequests } = useSmartContract();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000000";

  const categorizeTransactions = (txs: Transaction[]) => {
    return {
      pendingBids: txs.filter(
        (tx) =>
          tx.seller === DEFAULT_ADDRESS &&
          tx.buyer.toLowerCase() === account.toLowerCase()
      ),
      pendingAuctions: txs.filter(
        (tx) =>
          tx.buyer === DEFAULT_ADDRESS &&
          tx.seller.toLowerCase() === account.toLowerCase()
      ),
      pendingApprovals: txs.filter(
        (tx) =>
          tx.buyer !== DEFAULT_ADDRESS &&
          tx.seller.toLowerCase() === account.toLowerCase()
      ),
      pendingProposals: txs.filter(
        (tx) =>
          tx.seller !== DEFAULT_ADDRESS &&
          tx.buyer.toLowerCase() === account.toLowerCase()
      ),
      completedTransactions: txs.filter(
        (tx) =>
          tx.seller !== DEFAULT_ADDRESS &&
          tx.buyer !== DEFAULT_ADDRESS &&
          tx.state >= TransactionStates.Pending
      ),
    };
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!account || !assetId || assetId < 1) {
        setTransactions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response: GETResponse = await fetcher(
          `transactions/${assetId}/${account}`
        );
        if (!response?.success || !response?.data) {
          setError("Failed to fetch transactions");
          setTransactions([]);
          return;
        }

        setTransactions(response.data as Transaction[]);
        setError(null);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions");
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen, account, assetId]);

  const formatAddress = (address: string): string => {
    if (address === DEFAULT_ADDRESS) return "Pending";
    if (address.toLowerCase() === account.toLowerCase()) return "You";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  const getStatusColor = (status: TransactionStates): string => {
    switch (status) {
      case TransactionStates.Proposed:
        return "bg-yellow-100 text-yellow-800";
      case TransactionStates.Approved:
        return "bg-blue-100 text-blue-800";
      case TransactionStates.Pending:
        return "bg-purple-100 text-purple-800";
      case TransactionStates.Confirmed:
        return "bg-green-100 text-green-800";
      case TransactionStates.Finished:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-red-400";
    }
  };
  const renderTransaction = (tx: Transaction) => (
    <div className="grid grid-cols-2 gap-4 text-sm border rounded p-3">
      <div>
        <p className="text-green-600">Seller</p>
        <p
          className={`font-medium ${
            tx.seller === DEFAULT_ADDRESS ? "text-amber-600" : "text-black"
          } truncate`}
        >
          {formatAddress(tx.seller)}
        </p>
      </div>
      <div>
        <p className="text-green-600">Buyer</p>
        <p
          className={`font-medium ${
            tx.buyer === DEFAULT_ADDRESS ? "text-amber-600" : "text-black"
          } truncate`}
        >
          {formatAddress(tx.buyer)}
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
      <div className="col-span-2">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            tx.state
          )}`}
        >
          {TransactionStates[tx.state] === "None"
            ? "Waiting..."
            : TransactionStates[tx.state]}
        </span>
      </div>
    </div>
  );

  const categorizedTxs = categorizeTransactions(transactions);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title={`Asset #${assetId} Transactions`}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl text-black font-semibold mb-4">
              Transaction History
            </h2>

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
              {categorizedTxs.pendingBids.length > 0 && (
                <Collapsible
                  title="Pending Bids"
                  badge={categorizedTxs.pendingBids.length}
                  defaultOpen
                >
                  <div className="space-y-2">
                    {categorizedTxs.pendingBids.map((tx) =>
                      renderTransaction(tx)
                    )}
                  </div>
                </Collapsible>
              )}

              {categorizedTxs.pendingAuctions.length > 0 && (
                <Collapsible
                  title="Pending Auctions"
                  badge={categorizedTxs.pendingAuctions.length}
                >
                  <div className="space-y-2">
                    {categorizedTxs.pendingAuctions.map((tx) =>
                      renderTransaction(tx)
                    )}
                  </div>
                </Collapsible>
              )}

              {categorizedTxs.pendingApprovals.length > 0 && (
                <Collapsible
                  title="Sales Approvals"
                  badge={categorizedTxs.pendingApprovals.length}
                >
                  <div className="space-y-2">
                    {categorizedTxs.pendingApprovals.map((tx) =>
                      renderTransaction(tx)
                    )}
                  </div>
                </Collapsible>
              )}

              {categorizedTxs.pendingProposals.length > 0 && (
                <Collapsible
                  title="Purchases Proposals"
                  badge={categorizedTxs.pendingProposals.length}
                >
                  <div className="space-y-2">
                    {categorizedTxs.pendingProposals.map((tx) =>
                      renderTransaction(tx)
                    )}
                  </div>
                </Collapsible>
              )}

              {categorizedTxs.completedTransactions.length > 0 && (
                <Collapsible
                  title="Completed Transactions"
                  badge={categorizedTxs.completedTransactions.length}
                >
                  <div className="space-y-2">
                    {categorizedTxs.completedTransactions.map((tx) =>
                      renderTransaction(tx)
                    )}
                  </div>
                </Collapsible>
              )}
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
