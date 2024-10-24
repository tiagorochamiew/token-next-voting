// components/AssetCard.js
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

import { Asset } from "@/interfaces/Asset";

export default function AssetCard({ asset }: { asset: Asset }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <h3 className="text-lg font-semibold">{asset.title}</h3>
      </CardHeader>
      <CardContent className="p-4">
        {asset.url ? (
          <img
            src={asset.url}
            alt={asset.title}
            className="w-full h-48 object-cover rounded"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-600">
          <p>Koltena ID: {asset.koltenaId}</p>
          <p>Koltena Tokens: {asset.koltenaTokens}</p>
        </div>
      </CardContent>
    </Card>
  );
}
