"use client";

import Link from "next/link";

type Props = {
  id: string;
  name: string;
  itemCount: number;
  totalDebt: number;
  totalPaid: number;
  totalRemaining: number;
  totalMonthly: number;
  onDelete: (id: string) => void;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
}

const AVATAR_PALETTES = [
  ["#f59e0b", "#d97706"],
  ["#3b82f6", "#2563eb"],
  ["#22c55e", "#16a34a"],
  ["#ec4899", "#db2777"],
  ["#8b5cf6", "#7c3aed"],
  ["#06b6d4", "#0891b2"],
];

function getAvatar(name: string) {
  const idx = name.toUpperCase().charCodeAt(0) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

export default function PersonCard({
  id, name, itemCount, totalDebt, totalPaid, totalRemaining, totalMonthly, onDelete,
}: Props) {
  const progress = totalDebt > 0 ? Math.min((totalPaid / totalDebt) * 100, 100) : 0;
  const isFullyPaid = totalRemaining <= 0;
  const [from, to] = getAvatar(name);
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="group relative rounded-2xl border border-[#1e2d40] bg-[#0d1117] hover:border-[#2d3f55] transition-all duration-200 hover:shadow-xl hover:shadow-black/40 flex flex-col">
      <div className="p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {initials}
            </div>
            <div>
              <Link
                href={`/person/${id}`}
                className="font-semibold text-[#e2e8f0] hover:text-[#f59e0b] transition-colors font-[family-name:var(--font-syne)] leading-tight block"
              >
                {name}
              </Link>
              <p className="text-xs text-[#64748b] mt-0.5">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDelete(id)}
            className="opacity-0 group-hover:opacity-100 text-[#374151] hover:text-[#ef4444] transition-all text-xs px-2 py-1 rounded-lg hover:bg-red-950/30"
          >
            Remove
          </button>
        </div>

        {/* Metrics */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#64748b]">Total Utang</span>
            <span className="text-sm font-semibold text-[#ef4444] font-[family-name:var(--font-geist-mono)]">
              {formatCurrency(totalDebt)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#64748b]">Remaining</span>
            <span className={`text-sm font-semibold font-[family-name:var(--font-geist-mono)] ${isFullyPaid ? "text-[#22c55e]" : "text-[#f97316]"}`}>
              {isFullyPaid ? "Fully Paid" : formatCurrency(totalRemaining)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#64748b]">Monthly</span>
            <span className="text-sm font-semibold text-[#f59e0b] font-[family-name:var(--font-geist-mono)]">
              {formatCurrency(totalMonthly)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="w-full bg-[#1a2235] rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: isFullyPaid
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, #3b82f6, #2563eb)",
              }}
            />
          </div>
          <p className="text-xs text-[#374151] mt-1">{progress.toFixed(0)}% paid</p>
        </div>
      </div>

      {/* Footer link */}
      <Link
        href={`/person/${id}`}
        className="block border-t border-[#1e2d40] px-5 py-3 text-center text-xs font-semibold text-[#64748b] hover:text-[#f59e0b] hover:bg-[#111827] transition-all rounded-b-2xl"
      >
        View Details →
      </Link>
    </div>
  );
}
