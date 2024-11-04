export interface SaleRequest {
  seller: string;
  buyer: string;
  assetId: number;
  tokens: number;
  funds: number;
  bySeller: boolean;
  byBuyer: boolean;
  isConfirmed: boolean;
  isFinished: boolean;
  isWithdraw: boolean;
}
