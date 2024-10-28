import { Dispatch, SetStateAction } from "react";

// components/WalletModal.tsx
interface WalletModalProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsModalOpen: (isOpen: boolean) => void;
}

export default function WalletModal({
  setIsOpen,
  setIsModalOpen,
}: WalletModalProps) {
  const handleCreateFNFT = () => {
    setIsModalOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
        <div className="py-1">
          <button
            onClick={handleCreateFNFT}
            className="w-full px-4 py-2 text-sm text-white font-bold bg-green-600 hover:bg-green-700 rounded-md flex items-center justify-center"
          >
            Create F-NFT
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-center"
          >
            View Profile
          </button>
        </div>
      </div>
    </>
  );
}
