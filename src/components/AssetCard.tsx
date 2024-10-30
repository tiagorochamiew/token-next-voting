// components/AssetCard.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Image from "next/image";
import { ImageModal } from "./modals/ImageModal";
import { Asset } from "@/interfaces/Asset";

interface AssetCardProps {
  asset: Asset;
  onTitleClick?: (koltenaId: number) => void;
}

export default function AssetCard({ asset, onTitleClick }: AssetCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ImageFallback = () => (
    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded">
      <span className="text-gray-400">No Image</span>
    </div>
  );

  const handleImageError = () => {
    console.error("Error loading image:", asset.url);
    setImageError(true);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <h1 className="text-sm text-black">{asset.type}</h1>
          <h3
            className="text-lg font-semibold text-blue-800 cursor-pointer hover:text-blue-600"
            onClick={() => onTitleClick?.(asset.koltenaId)}
          >
            {asset.title}
          </h3>
        </CardHeader>
        <CardContent className="p-4">
          <div
            className="relative w-full aspect-[4/3] cursor-pointer group"
            onClick={() => !imageError && setIsModalOpen(true)}
          >
            {asset.url &&
            asset.url !== "" &&
            asset.url !== "string" &&
            !imageError ? (
              <>
                <Image
                  src={asset.url}
                  alt={asset.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded transition-transform duration-200 group-hover:scale-105"
                  onError={handleImageError}
                  loading="eager"
                  priority
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
                    View Image
                  </span>
                </div>
              </>
            ) : (
              <ImageFallback />
            )}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>ID: {asset.koltenaId}</p>
            <p>#{asset.koltenaTokens}</p>
          </div>
        </CardContent>
      </Card>

      <ImageModal
        src={asset.url}
        alt={asset.title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
