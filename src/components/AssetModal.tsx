import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Asset } from "../interfaces/Asset";

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMint: (numTokens: number) => Promise<string>;
}
const ASSET_TYPES = [
  { id: "RealEstate", label: "Real Estate" },
  { id: "NFT", label: "NFT Collectible" },
  { id: "Artwork", label: "Artwork" },
];
export default function AssetModal({
  isOpen,
  onClose,
  onMint,
}: AssetModalProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof Asset, string>>>(
    {}
  );
  const [formData, setFormData] = useState<Partial<Asset>>({
    type: ASSET_TYPES[0].id,
    title: "",
    koltenaTokens: 0,
    url: "",
    price: 0,
    condition: "",
    age: "",
    size: "",
    liquidity: "",
    historicalPerformance: [],
    marketTrends: [],
    externalEconomicFactors: [],
    volatility: [],
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Asset, string>> = {};
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.url) newErrors.url = "Image URL is required";
    if (!formData.koltenaTokens || formData.koltenaTokens <= 0) {
      newErrors.koltenaTokens = "Number of tokens must be greater than 0";
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.condition) newErrors.condition = "Condition is required";
    if (!formData.age) newErrors.age = "Age is required";
    if (!formData.size) newErrors.size = "Size is required";
    if (!formData.liquidity) newErrors.liquidity = "Liquidity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "koltenaTokens" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (formData.koltenaTokens) {
        await onMint(formData.koltenaTokens);
        onClose();
      }
    } catch (error) {
      console.error("Error minting asset:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to mint asset. Please try again.",
      }));
    }
  };

  const isProcessing = false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="p-4 border-b border-gray-200">
          <h2 className="text-xl text-black font-bold">Fractionalize Asset</h2>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                className="w-full p-2 border rounded-lg text-black bg-white"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              >
                {ASSET_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                className={`w-full p-2 border rounded-lg ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Tokens
              </label>
              <input
                className={`w-full p-2 border rounded-lg ${
                  errors.koltenaTokens ? "border-red-500" : "border-gray-300"
                }`}
                name="koltenaTokens"
                type="number"
                min={0}
                value={formData.koltenaTokens}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
              {errors.koltenaTokens && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.koltenaTokens}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                className={`w-full p-2 border rounded-lg ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                name="price"
                type="number"
                min={0}
                value={formData.price}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                className={`w-full p-2 border rounded-lg ${
                  errors.url ? "border-red-500" : "border-gray-300"
                }`}
                name="url"
                type="url"
                value={formData.url}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <input
                className={`w-full p-2 border rounded-lg ${
                  errors.condition ? "border-red-500" : "border-gray-300"
                }`}
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
              {errors.condition && (
                <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                className={`w-full p-2 border rounded-lg ${
                  errors.age ? "border-red-500" : "border-gray-300"
                }`}
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600">{errors.age}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <input
                className={`w-full p-2 border rounded-lg ${
                  errors.size ? "border-red-500" : "border-gray-300"
                }`}
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
              {errors.size && (
                <p className="mt-1 text-sm text-red-600">{errors.size}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liquidity
              </label>
              <input
                className={`w-full p-2 border rounded-lg ${
                  errors.liquidity ? "border-red-500" : "border-gray-300"
                }`}
                name="liquidity"
                value={formData.liquidity}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
              {errors.liquidity && (
                <p className="mt-1 text-sm text-red-600">{errors.liquidity}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={onClose}
                disabled={isProcessing}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Fractionalize
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
