// lib/config.ts
const apiConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  defaultImageUrl: process.env.DEFAULT_IMAGE_URL,
};

if (!apiConfig.apiUrl?.startsWith("https://")) {
  throw new Error("API_URL must use HTTPS");
}

if (!apiConfig.contractAddress) {
  throw new Error("CONTRACT_ADDRESS is required");
}

export default apiConfig;
