import { Asset } from "./Asset";

export interface GETResponse {
  success: boolean;
  data: Asset[];
}
export interface PUTResponse {
  success: boolean;
  data: Asset;
}
export interface POSTResponse {
  success: boolean;
  data: Asset;
}
