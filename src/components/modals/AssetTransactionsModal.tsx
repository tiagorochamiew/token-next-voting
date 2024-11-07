// components/modals/AssetTransactionsModal.tsx
import { useState, useEffect, useMemo } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSmartContract } from "@/contexts/SmartContractContext";
import { GETResponse, POSTResponse } from "@/interfaces/Response";
import { fetcher } from "@/api/fetcher";
import { patcher } from "@/api/patcher";
import { Transaction } from "@/interfaces/Transaction";
import { TransactionStates } from "@/enums/TransactionStates";
import { Collapsible } from "@/components/ui/Collapsible";
import { DEFAULT_ADDRESS } from "@/utils/Constants";
import { SalesModal } from "./SalesModal";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salesModalConfig, setSalesModalConfig] = useState<{
    isOpen: boolean;
    mode: "buy" | "sell" | "self-sell";
    ownerAddress?: string;
    maxTokens: number;
  } | null>(null);

  const handleSale = (tx: Transaction) => {
    setSalesModalConfig({
      isOpen: true,
      mode: "sell",
      ownerAddress: tx.buyer,
      maxTokens: tx.tokens,
    });
  };

  const handlePurchase = (tx: Transaction) => {
    setSalesModalConfig({
      isOpen: true,
      mode: "buy",
      ownerAddress: tx.seller,
      maxTokens: tx.tokens,
    });
  };
  const categorizedTxs = useMemo(() => {
    return {
      pendingBids: transactions.filter(
        (tx) =>
          ((tx.seller.toLowerCase() === DEFAULT_ADDRESS.toLowerCase() &&
            tx.buyer.toLowerCase() === account.toLowerCase()) ||
            (tx.buyer === DEFAULT_ADDRESS.toLowerCase() &&
              tx.seller.toLowerCase() !== account.toLowerCase())) &&
          tx.state === TransactionStates.None
      ),
      pendingAuctions: transactions.filter(
        (tx) =>
          (tx.seller.toLowerCase() === DEFAULT_ADDRESS.toLowerCase() &&
            tx.buyer.toLowerCase() !== account.toLowerCase()) ||
          (tx.buyer === DEFAULT_ADDRESS.toLowerCase() &&
            tx.seller.toLowerCase() === account.toLowerCase() &&
            tx.state === TransactionStates.None)
      ),
      pendingApprovals: transactions.filter(
        (tx) =>
          (tx.state === TransactionStates.Approved &&
            tx.seller.toLowerCase() === account.toLowerCase()) ||
          (tx.state === TransactionStates.Proposed &&
            tx.seller.toLowerCase() === account.toLowerCase())
      ),
      pendingProposals: transactions.filter(
        (tx) =>
          (tx.state === TransactionStates.Proposed &&
            tx.buyer.toLowerCase() === account.toLowerCase()) ||
          (tx.state === TransactionStates.Approved &&
            tx.buyer.toLowerCase() === account.toLowerCase())
      ),
      inProgressTransactions: transactions.filter(
        (tx) =>
          tx.state >= TransactionStates.Pending &&
          tx.state < TransactionStates.Finished
      ),
      completedTransactions: transactions.filter(
        (tx) => tx.state === TransactionStates.Finished
      ),
    };
  }, [transactions, account]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!account || !assetId || assetId < 1) {
        setTransactions([]);
        return;
      }

      setIsLoading(true);
      try {
        const logs = await fetchSaleRequests();
        console.log("Fetched logs:", logs.length);

        // Filter logs for current asset
        const assetLogs = logs.filter((log) => log.koltenaId === assetId);
        console.log("Filtered logs for asset:", assetLogs.length);

        // Format logs according to backend expectations
        const transactions = assetLogs.map((log) => ({
          koltenaId: Number(log.koltenaId),
          buyer: log.buyer,
          seller: log.seller,
          tokens: Number(log.tokens),
          funds: Number(log.funds),
          sellerApproved: log.sellerApproved,
          buyerProposed: log.buyerProposed,
          isConfirmed: log.isConfirmed,
          isFinished: log.isFinished,
          isWithdraw: log.isWithdraw,
        }));

        if (transactions.length > 0) {
          try {
            console.log("Posting transactions:", transactions);
            const postResponse: POSTResponse = await patcher(
              `transactions`,
              "POST",
              {
                transactions: transactions,
              }
            );

            if (!postResponse?.success) {
              console.error("Failed to post transactions:", postResponse);
              throw new Error("Failed to post transactions");
            }
            console.log("Successfully posted transactions");
          } catch (postError) {
            console.error("Error posting transactions:", postError);
          }
        }
        const response: GETResponse = await fetcher(
          `transactions/${assetId}/all`
        );
        if (!response?.success || !response?.data) {
          setError("Failed to fetch transactions");
          setTransactions([]);
          return;
        }
        console.log(
          "Fetched transactions:",
          (response.data as Transaction[]).length
        );
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
  const renderTransaction = (tx: Transaction, index: number) => (
    <div
      key={`${tx.id || ""}_${tx.seller}_${tx.buyer}_${tx.state}_${index}`}
      className="grid grid-cols-2 gap-4 text-sm border rounded p-3"
    >
      <div>
        <p className="text-green-600">Seller</p>
        <p
          className={`font-medium ${
            tx.seller.toLowerCase() === DEFAULT_ADDRESS.toLowerCase()
              ? "text-amber-600"
              : "text-black"
          } truncate`}
        >
          {formatAddress(tx.seller)}
        </p>
      </div>
      <div>
        <p className="text-green-600">Buyer</p>
        <p
          className={`font-medium ${
            tx.buyer === DEFAULT_ADDRESS.toLowerCase()
              ? "text-amber-600"
              : "text-black"
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
      <div className="col-span-2 flex justify-between items-center">
        {(() => {
          if (tx.state === TransactionStates.None) {
            if (
              tx.seller.toLowerCase() === DEFAULT_ADDRESS.toLowerCase() &&
              tx.buyer.toLowerCase() !== account.toLowerCase()
            ) {
              return (
                <Button
                  onClick={() => handlePurchase(tx)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                >
                  Accept Auction
                </Button>
              );
            }
            if (
              tx.buyer.toLowerCase() === DEFAULT_ADDRESS.toLowerCase() &&
              tx.seller.toLowerCase() !== account.toLowerCase()
            ) {
              return (
                <Button
                  onClick={() => handleSale(tx)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                >
                  Place Bid
                </Button>
              );
            }
          }
          if (
            tx.state === TransactionStates.Proposed &&
            tx.seller.toLowerCase() === account.toLowerCase()
          ) {
            return (
              <Button
                onClick={() => handleSale(tx)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                Approve Sale
              </Button>
            );
          }
          if (
            tx.state === TransactionStates.Approved &&
            tx.buyer.toLowerCase() === account.toLowerCase()
          ) {
            return (
              <Button
                onClick={() => handlePurchase(tx)}
                className="bg-green-600 hover:bg-green-700 text-white text-xs"
              >
                Propose Purchase
              </Button>
            );
          }

          return (
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                tx.state
              )}`}
            >
              {TransactionStates.None === tx.state
                ? "Waiting for a " +
                  (tx.seller.toLowerCase() === DEFAULT_ADDRESS.toLowerCase()
                    ? "Seller to Auction"
                    : "Buyer to Bid")
                : TransactionStates.Approved === tx.state
                ? `Waiting for ${
                    tx.buyer.toLowerCase() === account.toLowerCase()
                      ? "Your"
                      : "Buyer"
                  } Proposal`
                : TransactionStates.Proposed === tx.state
                ? `Waiting for ${
                    tx.seller.toLowerCase() === account.toLowerCase()
                      ? "Your"
                      : "Seller"
                  } Approval`
                : TransactionStates.Pending === tx.state
                ? `Waiting for ${
                    tx.seller.toLowerCase() === account.toLowerCase()
                      ? "Your"
                      : "Seller"
                  } Confirmation`
                : TransactionStates.Confirmed === tx.state
                ? `Waiting for ${
                    tx.seller.toLowerCase() === account.toLowerCase()
                      ? "Buyer"
                      : "Your"
                  } Payment`
                : TransactionStates[tx.state]}
            </span>
          );
        })()}
      </div>
    </div>
  );

  return (
    <>
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
                {categorizedTxs.inProgressTransactions.length > 0 && (
                  <Collapsible
                    title="Transactions In Progress"
                    badge={categorizedTxs.inProgressTransactions.length}
                  >
                    <div className="space-y-2">
                      {categorizedTxs.inProgressTransactions.map((tx, index) =>
                        renderTransaction(tx, index)
                      )}
                    </div>
                  </Collapsible>
                )}
                {categorizedTxs.pendingApprovals.length > 0 && (
                  <Collapsible
                    title="Pending Approvals"
                    badge={categorizedTxs.pendingApprovals.length}
                  >
                    <div className="space-y-2">
                      {categorizedTxs.pendingApprovals.map((tx, index) =>
                        renderTransaction(tx, index)
                      )}
                    </div>
                  </Collapsible>
                )}

                {categorizedTxs.pendingProposals.length > 0 && (
                  <Collapsible
                    title="Pending Proposals"
                    badge={categorizedTxs.pendingProposals.length}
                  >
                    <div className="space-y-2">
                      {categorizedTxs.pendingProposals.map((tx, index) =>
                        renderTransaction(tx, index)
                      )}
                    </div>
                  </Collapsible>
                )}
                {categorizedTxs.pendingBids.length > 0 && (
                  <Collapsible
                    title="Pending Bids"
                    badge={categorizedTxs.pendingBids.length}
                    defaultOpen
                  >
                    <div className="space-y-2">
                      {categorizedTxs.pendingBids.map((tx, index) =>
                        renderTransaction(tx, index)
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
                      {categorizedTxs.pendingAuctions.map((tx, index) =>
                        renderTransaction(tx, index)
                      )}
                    </div>
                  </Collapsible>
                )}

                {categorizedTxs.completedTransactions.length > 0 && (
                  <Collapsible
                    title="Transactions Completed"
                    badge={categorizedTxs.completedTransactions.length}
                  >
                    <div className="space-y-2">
                      {categorizedTxs.completedTransactions.map((tx, index) =>
                        renderTransaction(tx, index)
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

      {salesModalConfig && (
        <SalesModal
          isOpen={salesModalConfig.isOpen}
          onClose={() => setSalesModalConfig(null)}
          mode={salesModalConfig.mode}
          assetId={assetId}
          maxTokens={salesModalConfig.maxTokens}
          ownerAddress={salesModalConfig.ownerAddress}
          onTransactionComplete={() => {
            setSalesModalConfig(null);
          }}
        />
      )}
    </>
  );
}
