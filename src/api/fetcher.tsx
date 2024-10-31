import { GETResponse } from "@/interfaces/Response";
import apiConfig from "@/lib/config";

export async function fetcher(url: string): Promise<GETResponse> {
  const response = await fetch(`${apiConfig.apiUrl}/${url}`);

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const data = await response.json();
  return data;
}
