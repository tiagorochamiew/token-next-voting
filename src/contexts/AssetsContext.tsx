import { Asset } from "@/interfaces/Asset";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";

interface AssetsContextType {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  fetchAssets: (address: string) => void;
  setError: (error: string) => void;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

interface AssetsProviderProps {
  children: ReactNode;
}

interface AssetsResponse {
  success: boolean;
  data: Asset[];
}

export function AssetsProvider({ children }: AssetsProviderProps) {
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: response,
    error: swrError,
    isLoading,
  } = useSWR<AssetsResponse>(
    currentAddress ? "assets" : null,
    () => fetcher<AssetsResponse>("assets"),
    {
      revalidateOnFocus: false,
      onError: (err) => {
        setError(err.message);
      },
    }
  );

  const fetchAssets = useCallback((address: string) => {
    setCurrentAddress(address);
    setError(null);
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading assets...</div>;
  }
  if (response?.success === false || swrError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || swrError?.message}
      </div>
    );
  }
  const assets = response?.data ?? [];

  return (
    <AssetsContext.Provider
      value={{
        assets,
        isLoading,
        error: error || (swrError ? swrError.message : null),
        fetchAssets,
        setError,
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
}

export function useAssets() {
  const context = useContext(AssetsContext);
  if (!context) {
    throw new Error("useAssets must be used within an AssetsProvider");
  }
  return context;
}

export type { Asset };
