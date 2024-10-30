// components/modals/FormModal.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Asset } from "@/interfaces/Asset";
import { MintResult } from "@/interfaces/MintResult";
import { patcher } from "@/api/patcher";
import { AssetTypeFields } from "@/components/forms/AssetTypeFields";
import { GenericNumberInput } from "@/components/forms/GenericNumberInput";
import { GenericStringInput } from "@/components/forms/GenericStringInput";
import { GenericArrayInput } from "@/components/forms/GenericArrayInput";
import { validateAssetForm } from "@/utils/Validators";
import { formatFieldName } from "@/utils/Formatter";
import { ASSET_TYPES } from "@/utils/Constants";
import { toast } from "react-toastify";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMint: (numTokens: number) => Promise<MintResult>;
}

export default function FormModal({ isOpen, onClose, onMint }: FormModalProps) {
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

  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleArrayChange = (name: string, newValues: (string | number)[]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: newValues,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAssetForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsProcessing(true);
    try {
      const url = `${formData.type?.toLocaleLowerCase().replace(" ", "")}s`;

      if (!formData?.koltenaTokens || formData.koltenaTokens <= 0) {
        console.error("Error creating asset: koltenaTokens not found");
        return;
      }
      const postResponse = await patcher(url, "POST", formData);
      if (!postResponse || !postResponse?.success || !postResponse?.data) {
        console.error("Error creating asset:", postResponse);
        return;
      }
      toast.success("Asset created successfully, minting tokens@/components.");
      console.log("Created asset:", postResponse?.data);
      const asset = (postResponse?.data as Asset) || {};
      console.log("Minting asset with tokens:", asset.koltenaTokens);
      const { txHash, koltenaId } = await onMint(asset.koltenaTokens);
      toast.success(
        "Minted created successfully, updating database@/components."
      );
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
      toast.success("F-NFT created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating asset:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="min-h-screen py-6 flex flex-col justify-center">
        <Card className="w-full max-w-md bg-white mx-auto">
          <CardHeader className="w-80 h-20 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-xl text-black font-bold">
              Fractionalize Asset
            </h2>
          </CardHeader>
          <CardContent className="p-4 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <GenericStringInput
                name="Title"
                data={formData.title}
                errors={errors.title}
                isProcessing={isProcessing}
                handleInputChange={handleInputChange}
                formatFieldName={formatFieldName}
              />
              <GenericNumberInput
                name="Koltena Tokens"
                data={formData.koltenaTokens || 0}
                errors={errors.koltenaTokens || null}
                isProcessing={isProcessing}
                handleInputChange={handleInputChange}
                formatFieldName={formatFieldName}
              />
              <GenericNumberInput
                name="Price"
                data={formData.price || 0}
                errors={errors.price || null}
                isProcessing={isProcessing}
                handleInputChange={handleInputChange}
                formatFieldName={formatFieldName}
              />
              <GenericStringInput
                name="Image URL"
                data={formData.url}
                errors={errors.url}
                isProcessing={isProcessing}
                handleInputChange={handleInputChange}
                formatFieldName={formatFieldName}
              />
              <GenericStringInput
                name="Condition"
                data={formData.condition}
                errors={errors.condition}
                isProcessing={isProcessing}
                handleInputChange={handleInputChange}
                formatFieldName={formatFieldName}
              />
              <GenericStringInput
                name="Age"
                data={formData.age}
                errors={errors.age}
                isProcessing={isProcessing}
                handleInputChange={handleInputChange}
                formatFieldName={formatFieldName}
              />
              <GenericStringInput
                name="Size"
                data={formData.size}
                errors={errors.size}
                isProcessing={isProcessing}
                handleInputChange={handleInputChange}
                formatFieldName={formatFieldName}
              />
              <GenericStringInput
                name="Liquidity"
                data={formData.liquidity}
                errors={errors.liquidity}
                isProcessing={isProcessing}
                handleInputChange={handleInputChange}
                formatFieldName={formatFieldName}
              />
              <GenericArrayInput
                name="Historical Performance"
                values={formData.historicalPerformance || []}
                error={errors.historicalPerformance}
                isProcessing={isProcessing}
                onChange={(newValues) =>
                  handleArrayChange("historicalPerformance", newValues)
                }
              />
              <GenericArrayInput
                name="Market Trends"
                values={formData.marketTrends || []}
                error={errors.marketTrends}
                isProcessing={isProcessing}
                onChange={(newValues) =>
                  handleArrayChange("marketTrends", newValues)
                }
              />
              <GenericArrayInput
                name="External Economic Factors"
                values={formData.externalEconomicFactors || []}
                error={errors.externalEconomicFactors}
                isProcessing={isProcessing}
                onChange={(newValues) =>
                  handleArrayChange("externalEconomicFactors", newValues)
                }
              />
              <GenericArrayInput
                name="Volatility"
                values={formData.volatility || []}
                error={errors.volatility}
                isProcessing={isProcessing}
                isNumber={true}
                onChange={(newValues) =>
                  handleArrayChange("volatility", newValues)
                }
              />
              <div>
                <label className="block text-sm font-medium text-red-800 mb-1">
                  Select Type:
                </label>
                <select
                  className="w-full p-2 border rounded-lg text-white bg-blue-500"
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
                  <AssetTypeFields
                    type={formData.type || ""}
                    formData={formData}
                    errors={errors}
                    genericStringInput={(name, data, errors) => (
                      <GenericStringInput
                        name={name}
                        data={data}
                        errors={errors}
                        isProcessing={isProcessing}
                        handleInputChange={handleInputChange}
                        formatFieldName={formatFieldName}
                      />
                    )}
                    genericArrayInput={(name, data, errors, isNumber) => (
                      <GenericArrayInput
                        name={name}
                        values={data || []}
                        error={errors}
                        isProcessing={isProcessing}
                        isNumber={isNumber}
                        onChange={(newValues: (string | number)[]) =>
                          handleArrayChange(formatFieldName(name), newValues)
                        }
                      />
                    )}
                  />
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={() => setFormData({ type: ASSET_TYPES[0].id })}
                  disabled={isProcessing}
                  variant="clear"
                >
                  Clear
                </Button>
                <Button
                  onClick={onClose}
                  disabled={isProcessing}
                  variant="cancel"
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
}
