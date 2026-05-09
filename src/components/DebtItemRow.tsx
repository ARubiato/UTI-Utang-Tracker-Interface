"use client";

import { useState } from "react";

type Payment = { id: string; amount: number; paidAt: string };

type Props = {
  id: string;
  itemName: string;
  totalAmount: number;
  monthlyPayment: number;
  months: number;
  startDate: string;
  payments: Payment[];
  onRecordPayment: (debtId: string, amount: number) => void;
  onDelete: (debtId: string) => void;
};

function fmt(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export default function DebtItemRow({
  id, itemName, totalAmount, monthlyPayment, months, startDate, payments, onRecordPayment, onDelete,
}: Props) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(monthlyPayment.toString());
  const [showPayments, setShowPayments] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(totalAmount - totalPaid, 0);
  const progress = totalAmount > 0 ? Math.min((totalPaid / totalAmount) * 100, 100) : 100;
  const monthsRemaining = monthlyPayment > 0 ? Math.ceil(remaining / monthlyPayment) : 0;
  const isFullyPaid = remaining <= 0;

  const dueDate = new Date(startDate);
  dueDate.setMonth(dueDate.getMonth() + months);
  const isPastDue = !isFullyPaid && dueDate < new Date();

  function handlePay() {
    const amount = Number(paymentAmount);
    if (amount > 0) {
      onRecordPayment(id, amount);
      setShowPayment(false);
      setPaymentAmount(monthlyPayment.toString());
    }
  }

  return (
    <div className={`rounded-2xl border transition-all ${isFullyPaid ? "border-[#14532d]/40 bg-[#052e16]/20" : "border-[#1e2d40] bg-[#0d1117]"}`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h3 className="font-bold text-[#e2e8f0] font-[family-name:var(--font-syne)]">{itemName}</h3>
              {isFullyPaid && (
                <span className="text-[10px] font-bold text-[#22c55e] bg-[#052e16] border border-[#14532d]/50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  Paid
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-[#374151]">
                Started {fmtDate(startDate)}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isFullyPaid
                    ? "bg-[#052e16] text-[#22c55e] border border-[#14532d]/50"
                    : isPastDue
                    ? "bg-red-950/30 text-[#ef4444] border border-red-900/40"
                    : "bg-[#111827] text-[#64748b] border border-[#1e2d40]"
                }`}
              >
                {isFullyPaid ? "Completed" : `Due ${fmtDate(dueDate.toISOString())}`}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {!isFullyPaid && (
              <button
                onClick={() => setShowPayment(!showPayment)}
                className="text-xs px-3 py-1.5 bg-[#22c55e] text-black font-semibold rounded-lg hover:bg-[#16a34a] transition-colors"
              >
                Pay
              </button>
            )}
            <button
              onClick={() => onDelete(id)}
              className="text-xs px-3 py-1.5 text-[#374151] hover:text-[#ef4444] border border-[#1e2d40] hover:border-red-900/40 hover:bg-red-950/20 rounded-lg transition-all"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total", value: fmt(totalAmount), color: "#e2e8f0" },
            { label: "Monthly", value: fmt(monthlyPayment), color: "#f59e0b" },
            { label: "Months", value: `${months} total${!isFullyPaid ? ` / ${monthsRemaining} left` : ""}`, color: "#64748b" },
            {
              label: "Remaining",
              value: isFullyPaid ? "Fully Paid" : fmt(remaining),
              color: isFullyPaid ? "#22c55e" : "#f97316",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111827] rounded-xl p-3 border border-[#1a2235]">
              <p className="text-[10px] text-[#374151] uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-sm font-semibold font-[family-name:var(--font-geist-mono)] truncate" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full bg-[#1a2235] rounded-full h-1.5 mb-1">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: isFullyPaid
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, #3b82f6, #6366f1)",
              }}
            />
          </div>
          <div className="flex justify-between">
            <p className="text-[10px] text-[#374151] font-[family-name:var(--font-geist-mono)]">
              {fmt(totalPaid)} paid
            </p>
            <p className="text-[10px] text-[#374151]">{progress.toFixed(0)}%</p>
          </div>
        </div>

        {/* Payment input */}
        {showPayment && (
          <div className="mt-4 flex gap-2 items-center border-t border-[#1a2235] pt-4">
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              min="0"
              step="0.01"
              className="flex-1 bg-[#111827] border border-[#1e2d40] rounded-xl px-3.5 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-colors font-[family-name:var(--font-geist-mono)]"
            />
            <button onClick={handlePay} className="px-4 py-2 text-sm font-semibold bg-[#22c55e] text-black rounded-xl hover:bg-[#16a34a] transition-colors">
              Record
            </button>
            <button onClick={() => setShowPayment(false)} className="px-3 py-2 text-sm text-[#64748b] hover:text-[#e2e8f0] transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="border-t border-[#1a2235]">
          <button
            onClick={() => setShowPayments(!showPayments)}
            className="w-full px-5 py-3 text-left text-xs text-[#374151] hover:text-[#f59e0b] hover:bg-[#111827] transition-all flex items-center gap-2 rounded-b-2xl"
          >
            <span className={`transition-transform duration-200 ${showPayments ? "rotate-90" : ""}`}>▶</span>
            Payment history ({payments.length})
          </button>
          {showPayments && (
            <div className="px-5 pb-4 space-y-1 max-h-44 overflow-y-auto">
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-[#1a2235] last:border-0">
                  <span className="text-xs text-[#64748b]">{fmtDate(p.paidAt)}</span>
                  <span className="text-xs font-semibold text-[#22c55e] font-[family-name:var(--font-geist-mono)]">
                    {fmt(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
