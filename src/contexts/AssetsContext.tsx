import { Asset } from "@/interfaces/Asset";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import { GETResponse } from "@/interfaces/Response";
import { ITEMS_PER_PAGE } from "@/utils/Constants";

interface AssetsContextType {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  fetchAssets: (address: string, page: number) => void;
  setError: (error: string) => void;
  hasMore: boolean;
  currentPage: number;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

interface AssetsProviderProps {
  children: ReactNode;
}

export function AssetsProvider({ children }: AssetsProviderProps) {
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const {
    data: response,
    error: swrError,
    isLoading,
  } = useSWR<GETResponse>(
    currentAddress
      ? `assets?pageIndex=${currentPage}&pagesIZE=${ITEMS_PER_PAGE}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      onError: (err) => {
        setError(err.message);
      },
    }
  );

  const fetchAssets = useCallback((address: string, page: number = 1) => {
    setCurrentAddress(address);
    setCurrentPage(page);
    setError(null);
  }, []);

  useEffect(() => {
    if (response?.data) {
      setHasMore(response.data.length === ITEMS_PER_PAGE);
    }
  }, [response]);

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
        hasMore,
        currentPage,
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
