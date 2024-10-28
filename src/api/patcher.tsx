import { POSTResponse } from "@/interfaces/POSTResponse";
import { PUTResponse } from "@/interfaces/PUTResponse";

export async function patcher<T>(
  url: string,
  method: string,
  formData: T
): Promise<POSTResponse | PUTResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`, {
    method: method.toUpperCase(),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) throw new Error(`Failed to ${method.toUpperCase()} data.`);

  const data = await response.json();
  return data;
}
