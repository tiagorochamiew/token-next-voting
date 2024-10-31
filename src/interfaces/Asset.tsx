export interface Asset {
  id: string;
  type: string;
  koltenaId: number;
  koltenaTokens: number;
  balance: number;
  title: string;
  url: string;
  price: number;
  condition: string;
  age: string;
  size: string;
  liquidity: string;
  historicalPerformance: string[];
  marketTrends: string[];
  externalEconomicFactors: string[];
  volatility: number[];
  artist?: string; //Artwork Type
  artistReputation?: string; //Artwork Type
  culturalInfluence?: string; //Artwork Type
  exhibitionHistory?: string[]; //Artwork Type
  rarity?: string; //Artwork & NFT Type
  creatorReputation?: string; //NFT Type
  utility?: string; //NFT Type
  location?: string; //RealEstate Type
  regulatoryEnvironment?: string; //RealEstate Type
  features?: string[]; //RealEstate Type
  comparableSales?: string[]; //RealEstate Type
  rentalIncome?: number[]; //RealEstate Type
}
