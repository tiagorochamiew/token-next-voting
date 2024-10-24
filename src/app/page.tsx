// app/page.tsx
"use client";

import { Web3Provider } from "../contexts/Web3Context";
import { AssetsProvider } from "../contexts/AssetsContext";
import ConnectWallet from "../components/ConnectWallet";
import AssetGrid from "../components/AssetGrid";

export default function Home() {
  return (
    <Web3Provider>
      <AssetsProvider>
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-black"> Markeptlace</h1>
              <ConnectWallet />
            </div>
            <AssetGrid />
          </div>
        </div>
      </AssetsProvider>
    </Web3Provider>
  );
}
