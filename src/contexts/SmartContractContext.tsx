// contexts/SmartContractContext.tsx
import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/contexts/Web3Context";
import contract from "../../artifacts/contracts/koltena.sol/fnft.json";
import {
  ParseActiveEventLogs,
  ParseMintLogs,
  parseTransactionLogsToSaleRequests,
} from "@/utils/Parser";
import { MintResult } from "@/interfaces/MintResult";
import apiConfig from "@/lib/config";
import { SaleRequest } from "@/interfaces/Events";

const CONTRACT_ADDRESS = apiConfig.contractAddress || "";
const CONTRACT_ABI = contract.abi;

if (!CONTRACT_ADDRESS) {
  throw new Error("Contract address not configured");
}

if (!CONTRACT_ABI) {
  throw new Error("Contract Abi not configured");
}

interface SmartContractContextType {
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  mintAsset: (numTokens: number) => Promise<MintResult>;
  proposePurchaseOfTokens: (
    sellerAddress: string,
    assetId: number,
    tokens: number,
    funds: number
  ) => Promise<{ txHash: string }>;
  approveSaleOfTokens: (
    buyerAddress: string,
    assetId: number,
    tokens: number,
    funds: number
  ) => Promise<{ txHash: string }>;
  confirmSaleOfTokens: (
    buyerAddress: string,
    assetId: number
  ) => Promise<{ txHash: string }>;
  finishTransactionOfTokens: (
    sellerAddress: string,
    assetId: number,
    funds: number
  ) => Promise<{ txHash: string }>;
  fetchAssetOwners: (assetId: number) => Promise<string[]>;
  fetchAccountAssets: (address: string) => Promise<number[]>;
  fetchAccountBalance: (address: string, asset: number) => Promise<number>;
  fetchBalancesOfAccounts: (
    addresses: string[],
    assets: number[]
  ) => Promise<number[]>;
  fetchSaleRequests: () => Promise<SaleRequest[]>;
}

const SmartContractContext = createContext<
  SmartContractContextType | undefined
>(undefined);

interface SmartContractProviderProps {
  children: ReactNode;
}

export function SmartContractProvider({
  children,
}: SmartContractProviderProps) {
  const { account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, []);

  const fetchSaleRequests = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      const eventSignature =
        "SaleRequest(address,address,uint256,uint256,uint256,bool,bool,bool,bool,bool)";
      const eventTopic = ethers.id(eventSignature);

      const filter: ethers.Filter = {
        address: CONTRACT_ADDRESS,
        topics: [eventTopic],
        fromBlock: BigInt(0),
        toBlock: "latest",
      };

      const logs = await provider.getLogs(filter);
      const saleRequests = parseTransactionLogsToSaleRequests(logs);
      return saleRequests;
    } catch (err) {
      console.error("Error loading transactions:", err);
      throw err;
    }
  };

  const fetchAssetOwners = async (assetId: number): Promise<string[]> => {
    try {
      const contract = await getContract();

      const response = await contract.assetOwners(assetId);

      return response;
    } catch (error) {
      console.error("Error fetching account balances:", error);
      throw error;
    }
  };

  const fetchAccountBalance = async (
    address: string,
    asset: number
  ): Promise<number> => {
    try {
      const contract = await getContract();

      const response = await contract.balanceOf(address, asset);

      return Number(response);
    } catch (error) {
      console.error("Error fetching account balances:", error);
      throw error;
    }
  };

  const fetchBalancesOfAccounts = async (
    addresses: string[],
    assets: number[]
  ): Promise<number[]> => {
    try {
      const contract = await getContract();

      const response = await contract.balanceOfBatch(addresses, assets);

      return response.map((balance: bigint) => Number(balance));
    } catch (error) {
      console.error("Error fetching account balances:", error);
      throw error;
    }
  };

  const fetchAccountAssets = async (address: string): Promise<number[]> => {
    try {
      const contract = await getContract();

      const response = await contract.addressAssets(address);

      return response.map((asset: bigint) => Number(asset));
    } catch (error) {
      console.error("Error fetching account assets:", error);
      throw error;
    }
  };

  const mintAsset = useCallback(
    async (tokens: number) => {
      console.log("Minting " + tokens + " tokens");
      try {
        setIsLoading(true);
        setError(null);
        if (!account) {
          throw new Error("Please connect your wallet");
        }

        const contract = await getContract();
        const tx = await contract.mint(BigInt(tokens));
        const receipt = await tx.wait();

        const koltenaId = ParseMintLogs(receipt.logs[0].data).id;
        console.log("Minted asset with id: " + koltenaId);
        return {
          txHash: tx.hash,
          koltenaId,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Minting failed";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [account, getContract]
  );

  const proposePurchaseOfTokens = useCallback(
    async (
      sellerAddress: string,
      assetId: number,
      tokens: number,
      funds: number
    ) => {
      console.log(
        `${account} proposing ${sellerAddress} to purchase ${tokens} tokens (#${assetId}) for ${funds} ETH`
      );
      try {
        setIsLoading(true);
        setError(null);
        if (!account) {
          throw new Error("Please connect your wallet");
        }

        const contract = await getContract();
        const tx = await contract.proposePurchase(
          sellerAddress,
          BigInt(assetId),
          BigInt(tokens),
          BigInt(funds)
        );
        const receipt = await tx.wait();

        const logs = ParseActiveEventLogs(receipt.logs[0].data);
        console.log("ParseActiveEventLogs ", logs);
        return {
          txHash: tx.hash,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "proposePurchaseOfTokens failed";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [account, getContract]
  );

  const approveSaleOfTokens = useCallback(
    async (
      buyerAddress: string,
      assetId: number,
      tokens: number,
      funds: number
    ) => {
      console.log(
        `${account} approving the sale of ${tokens} tokens (#${assetId}) to ${buyerAddress} for ${funds} ETH`
      );
      try {
        setIsLoading(true);
        setError(null);
        if (!account) {
          throw new Error("Please connect your wallet");
        }

        const contract = await getContract();
        const tx = await contract.approveSale(
          buyerAddress,
          BigInt(assetId),
          BigInt(tokens),
          BigInt(funds)
        );
        const receipt = await tx.wait();

        const logs = ParseActiveEventLogs(receipt.logs[0].data);
        console.log("ParseActiveEventLogs ", logs);
        return {
          txHash: tx.hash,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "approveSaleOfTokens failed";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [account, getContract]
  );

  const confirmSaleOfTokens = useCallback(
    async (buyerAddress: string, assetId: number) => {
      console.log(
        `${account} confirming the sale of tokens (#${assetId}) to ${buyerAddress}`
      );
      try {
        setIsLoading(true);
        setError(null);
        if (!account) {
          throw new Error("Please connect your wallet");
        }

        const contract = await getContract();
        const tx = await contract.confirmSale(buyerAddress, BigInt(assetId));
        const receipt = await tx.wait();

        const logs = ParseActiveEventLogs(receipt.logs[0].data);
        console.log("ParseActiveEventLogs ", logs);
        return {
          txHash: tx.hash,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "confirmSaleOfTokens failed";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [account, getContract]
  );

  const finishTransactionOfTokens = useCallback(
    async (sellerAddress: string, assetId: number, funds: number) => {
      console.log(
        `${account} finishing the transaction of tokens (#${assetId}) by the ${sellerAddress} for ${funds} ETH`
      );
      try {
        setIsLoading(true);
        setError(null);
        if (!account) {
          throw new Error("Please connect your wallet");
        }

        const contract = await getContract();
        const tx = await contract.finishTransaction(
          sellerAddress,
          BigInt(assetId),
          {
            value: BigInt(funds),
          }
        );
        const receipt = await tx.wait();

        const logs = ParseActiveEventLogs(receipt.logs[0].data);
        console.log("ParseActiveEventLogs ", logs);
        return {
          txHash: tx.hash,
        };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "finishTransactionOfTokens failed";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [account, getContract]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <SmartContractContext.Provider
      value={{
        isLoading,
        error,
        clearError,
        mintAsset,
        approveSaleOfTokens,
        proposePurchaseOfTokens,
        confirmSaleOfTokens,
        finishTransactionOfTokens,
        fetchAssetOwners,
        fetchAccountBalance,
        fetchAccountAssets,
        fetchBalancesOfAccounts,
        fetchSaleRequests,
      }}
    >
      {children}
    </SmartContractContext.Provider>
  );
}

export function useSmartContract() {
  const context = useContext(SmartContractContext);
  if (!context) {
    throw new Error(
      "useSmartContract must be used within a SmartContractProvider"
    );
  }
  return context;
}
