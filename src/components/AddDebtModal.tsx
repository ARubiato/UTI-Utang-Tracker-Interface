"use client";

import { useState } from "react";
import Modal from "./Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    itemName: string;
    totalAmount: number;
    monthlyPayment: number;
    months: number;
    startDate: string;
  }) => void;
};

const inputClass = "w-full bg-[#111827] border border-[#1e2d40] rounded-xl px-3.5 py-2.5 text-sm text-[#e2e8f0] placeholder-[#374151] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-colors font-[family-name:var(--font-geist-mono)]";
const labelClass = "block text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-2";

export default function AddDebtModal({ isOpen, onClose, onSubmit }: Props) {
  const [itemName, setItemName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [months, setMonths] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemName.trim() || !totalAmount || !monthlyPayment || !months) return;
    onSubmit({
      itemName: itemName.trim(),
      totalAmount: Number(totalAmount),
      monthlyPayment: Number(monthlyPayment),
      months: Number(months),
      startDate,
    });
    setItemName("");
    setTotalAmount("");
    setMonthlyPayment("");
    setMonths("");
    setStartDate(new Date().toISOString().split("T")[0]);
    onClose();
  }

  const isValid = itemName.trim() && totalAmount && monthlyPayment && months;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Debt Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g. iPhone 15, Laptop, Cash Loan"
            className="w-full bg-[#111827] border border-[#1e2d40] rounded-xl px-3.5 py-2.5 text-sm text-[#e2e8f0] placeholder-[#374151] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-colors"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Total Amount</label>
            <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Monthly Payment</label>
            <input type="number" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} placeholder="0.00" min="0" step="0.01" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Months</label>
            <input type="number" value={months} onChange={(e) => setMonths(e.target.value)} placeholder="12" min="1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#64748b] hover:text-[#e2e8f0] transition-colors rounded-xl hover:bg-[#1a2235]">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="px-5 py-2 text-sm font-semibold bg-[#f59e0b] text-black rounded-xl hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add Item
          </button>
        </div>
      </form>
    </Modal>
  );
}
