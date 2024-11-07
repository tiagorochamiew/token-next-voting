// utils/validators.ts
import { Asset } from "@/interfaces/Asset";

export function validateAssetForm(formData: Partial<Asset>): {
  isValid: boolean;
  errors: Partial<Record<keyof Asset, string>>;
} {
  const errors: Partial<Record<keyof Asset, string>> = {};

  if (!formData.type) errors.type = "Type is required";
  if (!formData.title) errors.title = "Title is required";
  if (!formData.url) errors.url = "Image URL is required";
  if (!formData.koltenaTokens || formData.koltenaTokens <= 0) {
    errors.koltenaTokens = "Number of tokens must be greater than 0";
  }
  if (!formData.price || formData.price <= 0) {
    errors.price = "Price must be greater than 0";
  }
  if (!formData.condition) errors.condition = "Condition is required";
  if (!formData.age) errors.age = "Age is required";
  if (!formData.size) errors.size = "Size is required";
  if (!formData.liquidity) errors.liquidity = "Liquidity is required";

  if (!formData.historicalPerformance?.length) {
    errors.historicalPerformance =
      "At least one historical performance item is required";
  }
  if (!formData.marketTrends?.length) {
    errors.marketTrends = "At least one market trend is required";
  }
  if (!formData.externalEconomicFactors?.length) {
    errors.externalEconomicFactors = "At least one economic factor is required";
  }
  if (!formData.volatility?.length) {
    errors.volatility = "At least one volatility value is required";
  }

  switch (formData.type) {
    case "RealEstate":
      if (!formData.features?.length) {
        errors.features = "At least one feature is required";
      }
      if (!formData.comparableSales?.length) {
        errors.comparableSales = "At least one comparable sale is required";
      }
      if (!formData.rentalIncome?.length) {
        errors.rentalIncome = "At least one rental income value is required";
      }
      break;

    case "NFT":
      if (!formData.artist) errors.artist = "Artist is required";
      if (!formData.artistReputation)
        errors.artistReputation = "Artist reputation is required";
      if (!formData.rarity) errors.rarity = "Rarity is required";
      if (!formData.culturalInfluence)
        errors.culturalInfluence = "Cultural influence is required";
      if (!formData.exhibitionHistory?.length) {
        errors.exhibitionHistory = "At least one exhibition is required";
      }
      break;

    case "Artwork":
      if (!formData.creatorReputation)
        errors.creatorReputation = "Creator reputation is required";
      if (!formData.rarity) errors.rarity = "Rarity is required";
      if (!formData.utility) errors.utility = "Utility is required";
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
