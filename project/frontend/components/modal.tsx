"use client";

import React from "react";

type FullScreenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-[95vw] max-w-4xl h-[95vh] bg-gray-800 rounded-xl shadow-2xl overflow-auto p-8 animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold transition-colors"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default FullScreenModal;

interface ModalLabelProps {
  label: string;
}
export const ModalLabel = ({ label }: ModalLabelProps) => {
  return (
    <p className="text-3xl md:text-4xl font-extrabold text-center text-white mb-6">
      {label}
    </p>
  );
};
