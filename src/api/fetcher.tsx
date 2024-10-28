import { GETResponse } from "@/interfaces/GETResponse";

export async function fetcher(url: string): Promise<GETResponse> {
  console.log("Fetching data from", url);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`);

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const data = await response.json();
  return data;
}
