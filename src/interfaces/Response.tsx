// src/interfaces/Response.tsx
import { Asset } from "@/interfaces/Asset";
import { Transaction } from "@/interfaces/Transaction";

export interface GETResponse {
  success: boolean;
  data: Asset | Asset[] | Transaction | Transaction[];
}
export interface PUTResponse {
  success: boolean;
  data: Asset | Asset[];
}
export interface POSTResponse {
  success: boolean;
  data: Asset | Asset[] | Transaction | Transaction[];
}
