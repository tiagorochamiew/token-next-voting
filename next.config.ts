import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "purple-cheerful-tarsier-366.mypinata.cloud",
      "oaidalleapiprodscus.blob.core.windows",
      "oaidalleapiprodscus.blob.core.windows.net",
    ],
  },
};

export default nextConfig;
