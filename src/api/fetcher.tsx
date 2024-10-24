export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`);

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const data = await response.json();
  return data;
}
