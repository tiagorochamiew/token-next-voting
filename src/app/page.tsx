// app/page.tsx
"use client";
import { useState } from "react";
import { Web3Provider } from "@/contexts/Web3Context";
import { AssetsProvider } from "@/contexts/AssetsContext";
import { SmartContractProvider } from "@/contexts/SmartContractContext";
import { Tabs } from "@/components/ui/Tab";
import { Pages } from "@/enums/Pages";
import ConnectWallet from "@/components/ConnectWallet";
import AssetGrid from "@/components/AssetGrid";

const tabs = [
  { id: Pages.HOME, label: "Home" },
  { id: Pages.ACCOUNT, label: "My Account" },
];
export default function Home() {
  const [activeTab, setActiveTab] = useState(Pages.HOME);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Web3Provider>
      <SmartContractProvider>
        <AssetsProvider>
          <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-black"> Marketplace</h1>
                <ConnectWallet setIsModalOpen={setIsModalOpen} />{" "}
              </div>
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(tabId: string) => setActiveTab(tabId as Pages)}
              />
              <AssetGrid
                activeTab={activeTab}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
              />
            </div>
          </div>
        </AssetsProvider>
      </SmartContractProvider>
    </Web3Provider>
  );
}
