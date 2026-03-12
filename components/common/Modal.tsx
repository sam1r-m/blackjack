"use client";

import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-bg/85 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-border bg-panel p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {title && (
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-accent">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-lg text-muted transition-colors hover:bg-loss/10 hover:text-loss"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
