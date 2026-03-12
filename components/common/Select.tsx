"use client";

import { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

export default function Select({ value, options, onChange, disabled = false }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => String(o.value) === String(value));

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-sm border bg-panel-elevated px-3 py-2 text-left font-[family-name:var(--font-mono)] text-[13px] transition-all ${
          open
            ? "border-accent shadow-[0_0_0_2px_rgba(54,214,168,0.15)]"
            : "border-border hover:border-muted"
        } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
      >
        <span className="truncate text-text">{selected?.label ?? "—"}</span>
        <svg
          className={`ml-2 h-3 w-3 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-sm border border-border bg-panel-elevated shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          <div className="max-h-48 overflow-auto py-1">
            {options.map((opt) => {
              const active = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left font-[family-name:var(--font-mono)] text-[13px] transition-colors ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-text hover:bg-panel hover:text-accent"
                  }`}
                >
                  {active && (
                    <span className="mr-2 text-accent">›</span>
                  )}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
