import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Asset } from "../interfaces/Asset";
import { MintResult } from "@/interfaces/MintResult";
import { patcher } from "@/api/patcher";
interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMint: (numTokens: number) => Promise<MintResult>;
}
const ASSET_TYPES = [
  { id: "RealEstate", label: "Real Estate" },
  { id: "NFT", label: "NFT Collectible" },
  { id: "Artwork", label: "Artwork" },
  { id: "Test", label: "Test" },
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
    location: "",
    regulatoryEnvironment: "",
    features: [],
    comparableSales: [],
    rentalIncome: [],
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
    if (!formData.historicalPerformance?.length) {
      newErrors.historicalPerformance =
        "At least one historical performance item is required";
    }
    if (!formData.marketTrends?.length) {
      newErrors.marketTrends = "At least one market trend is required";
    }
    if (!formData.externalEconomicFactors?.length) {
      newErrors.externalEconomicFactors =
        "At least one economic factor is required";
    }
    if (!formData.volatility?.length) {
      newErrors.volatility = "At least one volatility value is required";
    }

    if (formData.type === "RealEstate") {
      if (!formData.features?.length) {
        newErrors.features = "At least one feature is required";
      }
      if (!formData.comparableSales?.length) {
        newErrors.comparableSales = "At least one comparable sale is required";
      }
      if (!formData.rentalIncome?.length) {
        newErrors.rentalIncome = "At least one rental income value is required";
      }
    } else if (formData.type === "NFT") {
      if (!formData.artist) newErrors.artist = "Artist is required";
      if (!formData.artistReputation)
        newErrors.artistReputation = "Artist reputation is required";
      if (!formData.rarity) newErrors.rarity = "Rarity is required";
      if (!formData.culturalInfluence)
        newErrors.culturalInfluence = "Cultural influence is required";
      if (!formData.exhibitionHistory?.length) {
        newErrors.exhibitionHistory = "At least one exhibition is required";
      }
    } else if (formData.type === "Artwork") {
      if (!formData.creatorReputation)
        newErrors.creatorReputation = "Creator reputation is required";
      if (!formData.rarity) newErrors.rarity = "Rarity is required";
      if (!formData.utility) newErrors.utility = "Utility is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "type" && value === "Test") {
      setFormData({
        type: "Real Estate",
        title: "Testing title",
        koltenaTokens: 10,
        url: process.env.NEXT_PUBLIC_DEFAULT_URL || "",
        price: 560,
        condition: "testing condition",
        age: "testing age",
        size: "testing size",
        liquidity: "testing liquidity",
        historicalPerformance: ["testing historical performance"],
        marketTrends: ["testing market trends"],
        externalEconomicFactors: ["testing external economic factors"],
        volatility: [100],
        location: "testing location",
        regulatoryEnvironment: "testing regulatory environment",
        features: ["testing features"],
        comparableSales: ["testing comparable sales"],
        rentalIncome: [30],
      });
      return;
    }

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
      const url = `${formData.type?.toLocaleLowerCase().replace(" ", "")}s`;
      const postResponse = await patcher(url, "POST", formData);
      if (!postResponse || !postResponse?.success || !postResponse?.data) {
        console.error("Error creating asset:", postResponse);
        return;
      }
      console.log("Created asset:", postResponse?.data);
      const asset = (postResponse?.data as Asset) || {};

      if (!asset?.koltenaTokens || asset.koltenaTokens <= 0) {
        console.error("Error creating asset: koltenaTokens not found");
        return;
      }
      console.log("Minting asset with tokens:", asset.koltenaTokens);
      const { txHash, koltenaId } = await onMint(asset.koltenaTokens);
      console.log("Minted asset:", { txHash, koltenaId });
      if (!koltenaId) {
        console.error("Error minting asset: koltenaId not found");
        return;
      }
      asset.koltenaId = Number(koltenaId);
      if (!asset.koltenaId || asset.koltenaId <= 0) {
        console.error("Error minting asset: koltenaId not found");
        return;
      }
      const putResponse = await patcher(`${url}/${asset.id}`, "PUT", asset);
      if (
        !putResponse ||
        !putResponse?.success ||
        !putResponse?.data ||
        putResponse?.data?.id !== asset.id
      ) {
        console.error("Error updating asset:", putResponse);
        return;
      }
      console.log("Updated asset:", putResponse?.data?.id);
      onClose();
    } catch (error) {
      console.error("Error creating asset:", error);
    }
  };

  const isProcessing = false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="min-h-screen py-6 flex flex-col justify-center">
        <Card className="w-full max-w-md bg-white mx-auto">
          <CardHeader className="w-80 h-20 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-xl text-black font-bold">
              Fractionalize Asset
            </h2>
          </CardHeader>
          <CardContent className="p-4 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {genericStringInput("Title", formData.title, errors.title)}
              {genericNumberInput(
                "Koltena Tokens",
                formData.koltenaTokens,
                errors.koltenaTokens
              )}
              {genericNumberInput("Price", formData.price, errors.price)}
              {genericStringInput("Image URL", formData.url, errors.url)}
              {genericStringInput(
                "Condition",
                formData.condition,
                errors.condition
              )}
              {genericStringInput("Age", formData.age, errors.age)}
              {genericStringInput("Size", formData.size, errors.size)}
              {genericStringInput(
                "Liquidity",
                formData.liquidity,
                errors.liquidity
              )}
              {genericArrayInput(
                "Historical Performance",
                formData.historicalPerformance,
                errors.historicalPerformance
              )}
              {genericArrayInput(
                "Market Trends",
                formData.marketTrends,
                errors.marketTrends
              )}
              {genericArrayInput(
                "External Economic Factors",
                formData.externalEconomicFactors,
                errors.externalEconomicFactors
              )}
              {genericArrayInput(
                "Volatility",
                formData.volatility,
                errors.volatility,
                true
              )}
              <div>
                <label className="block text-sm font-medium text-red-800 mb-1">
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
                {errors.type ? (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                ) : (
                  handleSpecificTypeAssets(formData.type || "")
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={setFormData.bind(null, {})}
                  disabled={isProcessing}
                  variant="clear"
                >
                  Clear
                </Button>
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
    </div>
  );

  function handleSpecificTypeAssets(type: string) {
    if (type === ASSET_TYPES[0].id)
      return (
        <>
          {genericStringInput("Location", formData.location, errors.location)}
          {genericStringInput(
            "Regulatory Environment",
            formData.regulatoryEnvironment,
            errors.regulatoryEnvironment
          )}
          {genericArrayInput("Features", formData.features, errors.features)}
          {genericArrayInput(
            "Comparable Sales",
            formData.comparableSales,
            errors.comparableSales
          )}
          {genericArrayInput(
            "Rental Income",
            formData.rentalIncome,
            errors.rentalIncome,
            true
          )}
        </>
      );

    if (type === ASSET_TYPES[1].id)
      return (
        <>
          {genericStringInput("Artist", formData.artist, errors.artist)}
          {genericStringInput(
            "Artist Reputation",
            formData.artistReputation,
            errors.artistReputation
          )}
          {genericStringInput("Rarity", formData.rarity, errors.rarity)}
          {genericStringInput(
            "Cultural Influence",
            formData.culturalInfluence,
            errors.culturalInfluence
          )}
          {genericArrayInput(
            "Exhibition History",
            formData.exhibitionHistory,
            errors.exhibitionHistory
          )}
        </>
      );
    if (type === ASSET_TYPES[2].id)
      return (
        <>
          (
          {genericStringInput(
            "Creator Reputation",
            formData.creatorReputation,
            errors.creatorReputation
          )}
          {genericStringInput("Rarity", formData.rarity, errors.rarity)}
          {genericStringInput("Utility", formData.utility, errors.utility)})
        </>
      );
  }

  function genericNumberInput(
    name: string,
    data: number | undefined,
    errors: string | undefined
  ) {
    const fieldName = formatFieldName(name);
    return (
      <div>
        <label className="block text-sm font-medium text-red-800 mb-1">
          {name}
        </label>
        <input
          className={`w-full p-2 border text-black rounded-lg ${
            errors ? "border-red-500" : "border-gray-300"
          }`}
          name={fieldName}
          type="number"
          min={0}
          value={data || ""}
          onChange={handleInputChange}
          disabled={isProcessing}
          required
        />
        {errors && <p className="mt-1 text-sm text-red-600">{errors}</p>}
      </div>
    );
  }

  function genericStringInput(
    name: string,
    data: string | undefined,
    errors: string | undefined
  ) {
    const fieldName = formatFieldName(name);
    return (
      <div>
        <label className="block text-sm font-medium text-red-800 mb-1">
          {name}
        </label>
        <input
          className={`w-full p-2 border text-black rounded-lg ${
            errors ? "border-red-500" : "border-gray-300"
          }`}
          name={fieldName}
          value={data || ""}
          onChange={handleInputChange}
          disabled={isProcessing}
          required
        />
        {errors && <p className="mt-1 text-sm text-red-600">{errors}</p>}
      </div>
    );
  }

  function formatFieldName(name: string): string {
    return name
      .toLowerCase()
      .replace("image url", "url")
      .split(" ")
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
  }

  function genericArrayInput(
    name: string,
    data: (string | number)[] | undefined,
    errors: string | undefined,
    isNumber: boolean = false
  ) {
    const fieldName = formatFieldName(name);

    const handleAddItem = () => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: [
          ...((prev[fieldName as keyof Asset] as (string | number)[]) || []),
          isNumber ? 0 : "",
        ],
      }));
    };

    const handleRemoveItem = (index: number) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: (
          prev[fieldName as keyof Asset] as (string | number)[]
        )?.filter((_, i) => i !== index),
      }));
    };

    const handleItemChange = (index: number, value: string) => {
      setFormData((prev) => {
        const array = [
          ...((prev[fieldName as keyof Asset] as (string | number)[]) || []),
        ];
        array[index] = isNumber ? Number(value) : value;
        return { ...prev, [fieldName]: array };
      });
    };
    return (
      <div>
        <label className="block text-sm font-medium text-red-800 mb-1">
          {name}
        </label>
        <div className="space-y-2">
          {data?.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                className={`flex-1 p-2 border text-black rounded-lg ${
                  errors ? "border-red-500" : "border-gray-300"
                }`}
                type={isNumber ? "number" : "text"}
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                disabled={isProcessing}
                required
              />
              <Button
                type="button"
                onClick={() => handleRemoveItem(index)}
                variant="secondary"
                className="px-2 py-1 text-red-600"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={handleAddItem}
            variant="secondary"
            className="w-full text-blue-600"
          >
            Add {name}
          </Button>
        </div>
        {errors && <p className="mt-1 text-sm text-red-600">{errors}</p>}
      </div>
    );
  }
}
