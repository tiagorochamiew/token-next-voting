export interface SaleRequest {
  koltenaId: number;
  buyer: string;
  seller: string;
  tokens: number;
  funds: number;
  sellerApproved: boolean;
  buyerProposed: boolean;
  isConfirmed: boolean;
  isFinished: boolean;
  isWithdraw: boolean;
}
