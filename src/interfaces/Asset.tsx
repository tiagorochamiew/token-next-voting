export interface Asset {
  id: string;
  type: string;
  koltenaId: number;
  koltenaTokens: number;
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
}
