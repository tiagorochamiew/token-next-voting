// components/AssetCard.js
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Image from "next/image";

import { Asset } from "@/interfaces/Asset";

export default function AssetCard({ asset }: { asset: Asset }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <h1 className="text-sm text-black">{asset.type}</h1>
        <h3 className="text-lg font-semibold text-blue-800">{asset.title}</h3>
      </CardHeader>
      <CardContent className="p-14">
        {asset.url && asset.url !== "" && asset.url !== "string" ? (
          <Image
            src={asset.url}
            alt={asset.title}
            width={500}
            height={192}
            className="object-cover rounded"
            style={{ width: "auto", height: "auto" }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-600">
          <p>ID: {asset.koltenaId}</p>
          <p>#{asset.koltenaTokens}</p>
        </div>
      </CardContent>
    </Card>
  );
}
