// contexts/AssetsContext.tsx
import { Asset } from "@/interfaces/Asset";
import { createContext, useContext, useState, ReactNode } from "react";
import useSWR from "swr";

interface AssetsContextType {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  fetchAssets: (address: string) => Promise<void>;
  setError: (error: string) => void;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

interface AssetsProviderProps {
  children: ReactNode;
}

export function AssetsProvider({ children }: AssetsProviderProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async (address: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assets`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch assets");
      }

      if (!data || data.success === false) {
        throw new Error("Failed to fetch assets");
      }

      setAssets(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch assets";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AssetsContext.Provider
      value={{
        assets,
        isLoading,
        error,
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
