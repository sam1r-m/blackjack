interface StatCardProps {
  label: string;
  value: string | number;
  color?: "accent" | "highlight" | "loss" | "info" | "text";
}

const colorMap = {
  accent: "text-accent",
  highlight: "text-highlight",
  loss: "text-loss",
  info: "text-info",
  text: "text-text",
};

export default function StatCard({ label, value, color = "text" }: StatCardProps) {
  return (
    <div className="rounded-md border border-border bg-panel-elevated p-3">
      <p className="text-[11px] text-muted">{label}</p>
      <p className={`mt-1 font-[family-name:var(--font-mono)] text-base font-semibold ${colorMap[color]}`}>
        {value}
      </p>
    </div>
  );
}
