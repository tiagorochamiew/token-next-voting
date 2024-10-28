// components/forms/AssetTypeFields.tsx
import { Asset } from "@/interfaces/Asset";

interface AssetTypeFieldsProps {
  type: string;
  formData: Partial<Asset>;
  errors: Partial<Record<keyof Asset, string>>;
  genericStringInput: (
    name: string,
    data: string | undefined,
    errors: string | undefined
  ) => JSX.Element;
  genericArrayInput: (
    name: string,
    data: (string | number)[] | undefined,
    errors: string | undefined,
    isNumber?: boolean
  ) => JSX.Element;
}

export function AssetTypeFields({
  type,
  formData,
  errors,
  genericStringInput,
  genericArrayInput,
}: AssetTypeFieldsProps) {
  switch (type) {
    case "RealEstate":
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

    case "NFT":
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

    case "Artwork":
      return (
        <>
          {genericStringInput(
            "Creator Reputation",
            formData.creatorReputation,
            errors.creatorReputation
          )}
          {genericStringInput("Rarity", formData.rarity, errors.rarity)}
          {genericStringInput("Utility", formData.utility, errors.utility)}
        </>
      );

    default:
      return null;
  }
}
