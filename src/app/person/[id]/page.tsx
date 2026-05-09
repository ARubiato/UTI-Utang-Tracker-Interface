"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DebtItemRow from "@/components/DebtItemRow";
import AddDebtModal from "@/components/AddDebtModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { generateDebtStatementPDF } from "@/lib/generatePDF";

type Payment = { id: string; amount: number; paidAt: string };
type DebtItem = {
  id: string;
  itemName: string;
  totalAmount: number;
  monthlyPayment: number;
  months: number;
  startDate: string;
  payments: Payment[];
};
type Person = { id: string; name: string; debtItems: DebtItem[] };

function fmt(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
}

const AVATAR_PALETTES = [
  ["#f59e0b", "#d97706"], ["#3b82f6", "#2563eb"], ["#22c55e", "#16a34a"],
  ["#ec4899", "#db2777"], ["#8b5cf6", "#7c3aed"], ["#06b6d4", "#0891b2"],
];
function getAvatar(name: string) {
  return AVATAR_PALETTES[name.toUpperCase().charCodeAt(0) % AVATAR_PALETTES.length];
}

export default function PersonDetail() {
  const params = useParams();
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [deleteDebtId, setDeleteDebtId] = useState<string | null>(null);
  const [showDeletePerson, setShowDeletePerson] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchPerson = useCallback(async () => {
    const res = await fetch(`/api/persons/${params.id}`);
    if (!res.ok) { router.push("/"); return; }
    const data = await res.json();
    setPerson(data);
    setLoading(false);
  }, [params.id, router]);

  useEffect(() => { fetchPerson(); }, [fetchPerson]);

  async function handleAddDebt(data: { itemName: string; totalAmount: number; monthlyPayment: number; months: number; startDate: string }) {
    await fetch(`/api/persons/${params.id}/debts`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    fetchPerson();
  }

  async function handleRecordPayment(debtId: string, amount: number) {
    await fetch(`/api/debts/${debtId}/payments`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount }),
    });
    fetchPerson();
  }

  async function handleDeleteDebt() {
    if (!deleteDebtId) return;
    await fetch(`/api/debts/${deleteDebtId}`, { method: "DELETE" });
    setDeleteDebtId(null);
    fetchPerson();
  }

  async function handleDeletePerson() {
    await fetch(`/api/persons/${params.id}`, { method: "DELETE" });
    router.push("/");
  }

  async function handleUpdateName() {
    if (!newName.trim()) return;
    await fetch(`/api/persons/${params.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }),
    });
    setEditingName(false);
    fetchPerson();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-[#1e2d40] border-t-[#f59e0b] rounded-full animate-spin" />
      </div>
    );
  }

  if (!person) return null;

  const totalDebt = person.debtItems.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = person.debtItems.reduce((s, i) => s + i.payments.reduce((ps, p) => ps + p.amount, 0), 0);
  const totalRemaining = Math.max(totalDebt - totalPaid, 0);
  const totalMonthly = person.debtItems.reduce((s, i) => s + i.monthlyPayment, 0);
  const [from, to] = getAvatar(person.name);
  const initials = person.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const stats = [
    { label: "Items",         value: String(person.debtItems.length), color: "#3b82f6",  mono: false },
    { label: "Total Utang",   value: fmt(totalDebt),                  color: "#ef4444",  mono: true  },
    { label: "Remaining",     value: fmt(totalRemaining),             color: "#f97316",  mono: true  },
    { label: "Monthly Due",   value: fmt(totalMonthly),               color: "#f59e0b",  mono: true  },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 w-full">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#374151] hover:text-[#f59e0b] transition-colors mb-8 group">
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        Back to Dashboard
      </Link>

      {/* Person header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            {initials}
          </div>
          <div>
            {editingName ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-xl font-bold bg-[#111827] border border-[#f59e0b] rounded-xl px-3 py-1.5 text-[#e2e8f0] focus:outline-none font-[family-name:var(--font-syne)]"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                />
                <button onClick={handleUpdateName} className="text-xs font-semibold text-[#f59e0b] hover:text-[#fbbf24]">Save</button>
                <button onClick={() => setEditingName(false)} className="text-xs text-[#374151] hover:text-[#64748b]">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-[#e2e8f0] font-[family-name:var(--font-syne)]">{person.name}</h1>
                <button
                  onClick={() => { setNewName(person.name); setEditingName(true); }}
                  className="text-xs text-[#374151] hover:text-[#f59e0b] transition-colors px-2 py-1 rounded-lg hover:bg-[#111827]"
                >
                  Edit
                </button>
              </div>
            )}
            <p className="text-xs text-[#374151] mt-0.5">{person.debtItems.length} debt item{person.debtItems.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => void generateDebtStatementPDF(person.name, person.debtItems)}
            className="px-3.5 py-2 text-[#f59e0b] border border-[#f59e0b]/30 rounded-xl hover:bg-[#f59e0b]/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Export PDF
          </button>
          <button
            onClick={() => setShowAddDebt(true)}
            className="px-3.5 py-2 bg-[#f59e0b] text-black rounded-xl font-semibold text-xs hover:bg-[#fbbf24] transition-colors shadow-lg shadow-amber-900/20"
          >
            + Add Debt Item
          </button>
          <button
            onClick={() => setShowDeletePerson(true)}
            className="px-3.5 py-2 text-[#ef4444] border border-[#ef4444]/20 rounded-xl hover:bg-red-950/20 hover:border-red-900/40 text-xs font-semibold transition-all"
          >
            Delete Person
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#0d1117] border border-[#1e2d40] rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: s.color }} />
            <p className="text-[10px] font-semibold text-[#374151] uppercase tracking-widest mb-2">{s.label}</p>
            <p
              className={`text-xl font-bold truncate ${s.mono ? "font-[family-name:var(--font-geist-mono)]" : "font-[family-name:var(--font-syne)]"}`}
              style={{ color: s.color }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Debt items */}
      {person.debtItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#1e2d40] rounded-2xl">
          <p className="text-[#374151] font-[family-name:var(--font-syne)] mb-1">No debt items yet</p>
          <p className="text-[#374151] text-sm">Click &quot;+ Add Debt Item&quot; to add one</p>
        </div>
      ) : (
        <div className="space-y-4">
          {person.debtItems.map((item) => (
            <DebtItemRow
              key={item.id}
              {...item}
              onRecordPayment={handleRecordPayment}
              onDelete={(id) => setDeleteDebtId(id)}
            />
          ))}
        </div>
      )}

      <AddDebtModal isOpen={showAddDebt} onClose={() => setShowAddDebt(false)} onSubmit={handleAddDebt} />
      <ConfirmDialog isOpen={!!deleteDebtId} onClose={() => setDeleteDebtId(null)} onConfirm={handleDeleteDebt} title="Delete Debt Item" message="This will also delete all payment history for this item." />
      <ConfirmDialog isOpen={showDeletePerson} onClose={() => setShowDeletePerson(false)} onConfirm={handleDeletePerson} title="Delete Person" message="This will delete all their debt items and payment history." />
    </main>
  );
}
