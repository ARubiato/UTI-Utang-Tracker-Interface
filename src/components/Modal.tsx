"use client";

import { ReactNode, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1117] border border-[#1e2d40] rounded-2xl shadow-2xl shadow-black/60 p-6 w-full max-w-md z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#e2e8f0] font-[family-name:var(--font-syne)]">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a2235] transition-all text-lg leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
