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
import { ParseActiveEventLogs, ParseMintLogs } from "@/utils/Parser";
import { MintResult } from "@/interfaces/MintResult";
import apiConfig from "@/lib/config";

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
  fetchAssetOwners: (assetId: number) => Promise<string[]>;
  fetchAccountAssets: (address: string) => Promise<number[]>;
  fetchAccountBalance: (address: string, asset: number) => Promise<number>;
  fetchBalancesOfAccounts: (
    addresses: string[],
    assets: number[]
  ) => Promise<number[]>;
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
        fetchAssetOwners,
        fetchAccountBalance,
        fetchAccountAssets,
        fetchBalancesOfAccounts,
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
