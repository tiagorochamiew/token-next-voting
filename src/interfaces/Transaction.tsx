import { TransactionStates } from "@/enums/TransactionStates";

export interface Transaction {
  id: number;
  koltenaId: number;
  buyer: string;
  seller: string;
  tokens: number;
  funds: number;
  state: TransactionStates;
}
