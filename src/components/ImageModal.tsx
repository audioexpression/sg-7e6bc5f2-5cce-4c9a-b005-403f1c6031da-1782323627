import React, { useState } from "react";
import { X } from "lucide-react";

interface ImageModalProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageModal({ src, alt, className = "" }: ImageModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div
            className="relative max-w-4xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white text-center mt-4 text-lg font-semibold">{alt}</p>
          </div>
        </div>
      )}
    </>
  );
}