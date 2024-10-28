// components/ImageModal.tsx
import Image from "next/image";

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen w-full py-8 flex items-center justify-center">
        <div className="relative max-w-[90vw]">
          <div className="relative">
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={800}
              className="object-contain rounded max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "100%", height: "auto" }}
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 font-bold text-white hover:text-gray-300 bg-red-600 w-10 h-10 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
