"use client";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="group relative flex items-stretch">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-sm border border-border bg-panel px-2 py-1 font-[family-name:var(--font-pixel)] text-[7px] text-text opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
        {content}
      </div>
    </div>
  );
}
