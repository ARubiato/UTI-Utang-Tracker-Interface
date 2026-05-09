"use client";

import { useEffect, useState, useCallback } from "react";
import SummaryBar from "@/components/SummaryBar";
import PersonCard from "@/components/PersonCard";
import AddPersonModal from "@/components/AddPersonModal";
import ConfirmDialog from "@/components/ConfirmDialog";

type PersonSummary = {
  id: string;
  name: string;
  itemCount: number;
  totalDebt: number;
  totalPaid: number;
  totalRemaining: number;
  totalMonthly: number;
};

export default function Dashboard() {
  const [persons, setPersons] = useState<PersonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPersons = useCallback(async () => {
    const res = await fetch("/api/persons");
    const data = await res.json();
    setPersons(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPersons(); }, [fetchPersons]);

  async function handleAddPerson(name: string) {
    await fetch("/api/persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    fetchPersons();
  }

  async function handleDeletePerson() {
    if (!deleteId) return;
    await fetch(`/api/persons/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchPersons();
  }

  const totalDebt = persons.reduce((sum, p) => sum + p.totalDebt, 0);
  const totalRemaining = persons.reduce((sum, p) => sum + p.totalRemaining, 0);
  const totalMonthly = persons.reduce((sum, p) => sum + p.totalMonthly, 0);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b] flex items-center justify-center">
              <span className="text-black text-xs font-black font-[family-name:var(--font-syne)]">₱</span>
            </div>
            <h1 className="text-3xl font-black text-[#e2e8f0] tracking-tight font-[family-name:var(--font-syne)]">
              UTI
            </h1>
          </div>
          <p className="text-sm text-[#374151] ml-11">Utang Tracker Interface</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#f59e0b] text-black rounded-xl font-semibold text-sm hover:bg-[#fbbf24] transition-colors shadow-lg shadow-amber-900/20"
        >
          + Add Person
        </button>
      </div>

      <SummaryBar
        totalPeople={persons.length}
        totalDebt={totalDebt}
        totalMonthly={totalMonthly}
        totalRemaining={totalRemaining}
      />

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-6 h-6 border-2 border-[#1e2d40] border-t-[#f59e0b] rounded-full animate-spin" />
        </div>
      ) : persons.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#1e2d40] rounded-2xl">
          <p className="text-[#374151] text-lg font-[family-name:var(--font-syne)] mb-1">No debtors yet</p>
          <p className="text-[#374151] text-sm">Click &quot;+ Add Person&quot; to start tracking</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {persons.map((person) => (
            <PersonCard
              key={person.id}
              {...person}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <AddPersonModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddPerson} />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeletePerson}
        title="Remove Person"
        message="This will permanently delete all their debt items and payment history."
      />
    </main>
  );
}
