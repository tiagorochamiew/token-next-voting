// components/tabs/Home.tsx
import { useState } from "react";
import { Asset } from "@/interfaces/Asset";
import { Button } from "@/components/ui/Button";
import AssetCard from "../AssetCard";
import AssetModal from "../modals/AssetModal";

interface HomeTabProps {
  assets: Asset[];
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
  loadNextPage: () => void;
  loadPreviousPage: () => void;
  loadFirstPage: () => void;
}

export function HomeTab({
  assets,
  isLoading,
  hasMore,
  currentPage,
  loadNextPage,
  loadPreviousPage,
  loadFirstPage,
}: HomeTabProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  const handleTitleClick = (koltenaId: number) => {
    setSelectedAssetId(koltenaId);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onTitleClick={handleTitleClick}
          />
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-4">Loading more assets...</div>
      )}

      <div className="flex justify-center gap-4 py-4">
        {!isLoading && currentPage !== 1 && (
          <Button
            onClick={loadPreviousPage}
            variant="secondary"
            className="bg-blue-200 hover:bg-blue-700 text-black"
          >
            Previous
          </Button>
        )}

        {!isLoading && hasMore && (
          <Button
            onClick={loadNextPage}
            variant="secondary"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Load More
          </Button>
        )}

        {!isLoading && currentPage !== 1 && (
          <Button
            onClick={loadFirstPage}
            variant="secondary"
            className="bg-red-400 hover:bg-red-500 text-white-300"
          >
            Reset
          </Button>
        )}
      </div>

      {!isLoading && assets.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No assets available
        </div>
      )}

      <AssetModal
        isOpen={selectedAssetId !== null}
        onClose={() => setSelectedAssetId(null)}
        asset={assets.find((a) => a.koltenaId === selectedAssetId) || null}
      />
    </>
  );
}
