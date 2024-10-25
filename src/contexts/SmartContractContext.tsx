// contexts/SmartContractContext.tsx
import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./Web3Context";
import contract from "../../artifacts/contracts/koltena.sol/fnft.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const CONTRACT_ABI = contract.abi;

interface SmartContractContextType {
  isLoading: boolean;
  error: string | null;
  mintAsset: (numTokens: number) => Promise<string>;
  clearError: () => void;
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

  const mintAsset = useCallback(
    async (tokens: number) => {
      try {
        setIsLoading(true);
        setError(null);

        if (!account) {
          throw new Error("Please connect your wallet");
        }

        const contract = await getContract();
        const tx = await contract.mint(BigInt(tokens));
        await tx.wait();
        console.log("Minted", tx.hash);
        return tx.hash;
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <SmartContractContext.Provider
      value={{
        isLoading,
        error,
        mintAsset,
        clearError,
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
