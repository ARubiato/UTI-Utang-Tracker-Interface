"use client";

type Props = {
  totalPeople: number;
  totalDebt: number;
  totalMonthly: number;
  totalRemaining: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
}

const metrics = (p: Props) => [
  { label: "People Tracked", value: String(p.totalPeople), accent: "#3b82f6", dim: "rgba(59,130,246,0.08)" },
  { label: "Total Utang",    value: formatCurrency(p.totalDebt),      accent: "#ef4444", dim: "rgba(239,68,68,0.08)",   mono: true },
  { label: "Remaining",      value: formatCurrency(p.totalRemaining), accent: "#f97316", dim: "rgba(249,115,22,0.08)", mono: true },
  { label: "Monthly Due",    value: formatCurrency(p.totalMonthly),   accent: "#f59e0b", dim: "rgba(245,158,11,0.08)", mono: true },
];

export default function SummaryBar(props: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {metrics(props).map((m) => (
        <div
          key={m.label}
          className="relative rounded-xl p-5 overflow-hidden border border-[#1e2d40]"
          style={{ background: m.dim }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
            style={{ background: m.accent }}
          />
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-2">
            {m.label}
          </p>
          <p
            className={`text-2xl font-bold truncate ${m.mono ? "font-[family-name:var(--font-geist-mono)]" : "font-[family-name:var(--font-syne)]"}`}
            style={{ color: m.accent }}
          >
            {m.value}
          </p>
        </div>
      ))}
    </div>
  );
}
