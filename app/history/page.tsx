import Link from "next/link";
import HistoryTable from "@/components/history/HistoryTable";

export default function HistoryPage() {
  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mb-4 flex items-center gap-4 border-b border-border pb-3">
        <Link
          href="/simulator"
          className="rounded-md border border-border px-3 py-1.5 font-[family-name:var(--font-pixel)] text-[10px] text-muted transition-all hover:border-accent hover:text-accent"
        >
          ◄ Back
        </Link>
        <h1 className="font-[family-name:var(--font-pixel)] text-sm text-text">
          History
        </h1>
      </div>
      <HistoryTable />
    </div>
  );
}
