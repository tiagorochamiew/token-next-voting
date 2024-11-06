import { POSTResponse } from "@/interfaces/Response";
import { PUTResponse } from "@/interfaces/Response";
import apiConfig from "@/lib/config";
export async function patcher<T>(
  url: string,
  method: string,
  formData: T
): Promise<POSTResponse | PUTResponse> {
  console.log("url ", `${apiConfig.apiUrl}/${url}`);
  console.log("method ", `${method}`);
  console.log("formData ", `${formData}`);
  const response = await fetch(`${apiConfig.apiUrl}/${url}`, {
    method: method.toUpperCase(),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) throw new Error(`Failed to ${method.toUpperCase()} data.`);

  const data = await response.json();
  return data;
}
