import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["example.com", "purple-cheerful-tarsier-366.mypinata.cloud"],
  },
};

export default nextConfig;
