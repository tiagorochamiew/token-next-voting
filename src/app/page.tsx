// app/page.tsx
"use client";

import { useState } from "react";
import { Web3Provider } from "../contexts/Web3Context";
import { AssetsProvider } from "../contexts/AssetsContext";
import ConnectWallet from "../components/ConnectWallet";
import AssetGrid from "../components/AssetGrid";
import { Tabs } from "../components/ui/Tab";
import { PageTabs } from "../enums/PageTabs";

const tabs = [
  { id: PageTabs.HOME, label: "Home" },
  { id: PageTabs.ACCOUNT, label: "My Account" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(PageTabs.HOME);
  return (
    <Web3Provider>
      <AssetsProvider>
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-black"> Markeptlace</h1>
              <ConnectWallet />
            </div>
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId: string) => setActiveTab(tabId as PageTabs)}
            />
            <AssetGrid activeTab={activeTab} />
          </div>
        </div>
      </AssetsProvider>
    </Web3Provider>
  );
}
