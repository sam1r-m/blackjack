"use client";

import { useState, useEffect } from "react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export default function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
}: NumberInputProps) {
  const [raw, setRaw] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // sync from parent when not focused
  useEffect(() => {
    if (!focused) setRaw(String(value));
  }, [value, focused]);

  const commit = () => {
    setFocused(false);
    const parsed = Number(raw);
    const final = isNaN(parsed) || raw.trim() === "" ? 0 : parsed;
    const clamped =
      min !== undefined && final < min ? min :
      max !== undefined && final > max ? max : final;
    onChange(clamped);
    setRaw(String(clamped));
  };

  const decrement = () => {
    const next = value - step;
    if (min !== undefined && next < min) return;
    onChange(next);
  };

  const increment = () => {
    const next = value + step;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  return (
    <div className={`flex items-stretch overflow-hidden rounded-sm border border-border ${disabled ? "opacity-40" : ""}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={disabled}
        className="flex w-8 shrink-0 items-center justify-center bg-panel-elevated text-muted transition-colors hover:bg-border hover:text-text active:bg-accent/20 active:text-accent disabled:pointer-events-none"
      >
        <span className="text-sm font-bold">−</span>
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={raw}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || /^-?\d*\.?\d*$/.test(v)) setRaw(v);
        }}
        onFocus={() => setFocused(true)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        disabled={disabled}
        className="w-full !rounded-none !border-x-0 !border-y-0 bg-panel-elevated py-2 text-center font-[family-name:var(--font-mono)] text-[13px] text-text focus:outline-none"
      />
      <button
        type="button"
        onClick={increment}
        disabled={disabled}
        className="flex w-8 shrink-0 items-center justify-center bg-panel-elevated text-muted transition-colors hover:bg-border hover:text-text active:bg-accent/20 active:text-accent disabled:pointer-events-none"
      >
        <span className="text-sm font-bold">+</span>
      </button>
    </div>
  );
}
