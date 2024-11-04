// components/modals/SalesModal.tsx
import { useState, ChangeEvent } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSmartContract } from "@/contexts/SmartContractContext";
import { ethers } from "ethers";

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "buy" | "sell" | "self-sell";
  assetId: number;
  maxTokens: number;
  ownerAddress?: string;
  onTransactionComplete?: () => void;
}

export function SalesModal({
  isOpen,
  onClose,
  mode,
  assetId,
  maxTokens,
  ownerAddress,
  onTransactionComplete,
}: SalesModalProps) {
  const { account } = useWeb3();
  const { proposePurchaseOfTokens, approveSaleOfTokens, isLoading, error } =
    useSmartContract();

  const [buyerAddress, setBuyerAddress] = useState<string>(
    mode === "buy" ? account : mode === "sell" ? ownerAddress || "" : ""
  );
  const [numTokens, setNumTokens] = useState<string>("");
  const [funds, setFunds] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  const sellerAddress = mode === "buy" ? ownerAddress || "" : account;

  const validateForm = (): boolean => {
    if (!numTokens || parseInt(numTokens) <= 0) {
      setValidationError("Please enter a valid number of tokens");
      return false;
    }
    if (parseInt(numTokens) > maxTokens) {
      setValidationError(`Maximum available tokens: ${maxTokens}`);
      return false;
    }
    if (!funds || parseFloat(funds) <= 0) {
      setValidationError("Please enter a valid amount of funds");
      return false;
    }
    if (mode === "self-sell" && !ethers.isAddress(buyerAddress)) {
      setValidationError("Please enter a valid buyer address");
      return false;
    }
    return true;
  };

  const handleNumTokensChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNumTokens(e.target.value);
  };

  const handleFundsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFunds(e.target.value);
  };

  const handleBuyerAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBuyerAddress(e.target.value);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (mode === "buy") {
        await proposePurchaseOfTokens(
          account,
          sellerAddress,
          parseInt(numTokens),
          parseFloat(funds)
        );
      } else {
        await approveSaleOfTokens(
          account,
          buyerAddress,
          parseInt(numTokens),
          parseFloat(funds)
        );
      }
      onTransactionComplete?.();
      onClose();
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title={`${
        mode === "buy" ? "Purchase" : "Sell"
      } Tokens for Asset #${assetId}`}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
              {mode === "buy" ? "Purchase" : "Sell"} Tokens
            </h2>

            <div className="space-y-4">
              {mode === "self-sell" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Buyer Address
                  </label>
                  <Input
                    value={buyerAddress}
                    onChange={handleBuyerAddressChange}
                    placeholder="Enter Buyer's address"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Tokens
                </label>
                <Input
                  type="number"
                  value={numTokens}
                  onChange={handleNumTokensChange}
                  placeholder={`Max: ${maxTokens}`}
                  className="mt-1"
                  max={maxTokens}
                  min={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (ETH)
                </label>
                <Input
                  type="number"
                  value={funds}
                  onChange={handleFundsChange}
                  placeholder="Enter price in ETH"
                  className="mt-1"
                  step="0.00000001"
                />
              </div>

              {(validationError || error) && (
                <div className="text-red-500 text-sm">
                  {validationError || error}
                </div>
              )}
            </div>
          </div>

          <div className="border-t p-4 flex justify-end space-x-2">
            <Button
              onClick={onClose}
              variant="secondary"
              className="bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading
                ? "Processing..."
                : mode === "buy"
                ? "Purchase"
                : "Sell"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
