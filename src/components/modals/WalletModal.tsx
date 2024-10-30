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
  const handleViewProfile = () => {
    //TO BE IMPLEMENTED
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
        <div className="py-1">
          {genericHandler("Create F-NFT", handleCreateFNFT)}
          {genericHandler("View Profile", handleViewProfile)}
        </div>
      </div>
    </>
  );

  function genericHandler(name: string, onHandle: () => void) {
    return (
      <button
        onClick={onHandle}
        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-700 hover:text-white rounded-md flex items-center justify-center"
      >
        {name}
      </button>
    );
  }
}
