"use client";

import { useState } from "react";
import Modal from "./Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

const inputClass = "w-full bg-[#111827] border border-[#1e2d40] rounded-xl px-3.5 py-2.5 text-sm text-[#e2e8f0] placeholder-[#374151] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-colors";

export default function AddPersonModal({ isOpen, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    setName("");
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Person">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Juan dela Cruz"
            className={inputClass}
            autoFocus
          />
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#64748b] hover:text-[#e2e8f0] transition-colors rounded-xl hover:bg-[#1a2235]">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-5 py-2 text-sm font-semibold bg-[#f59e0b] text-black rounded-xl hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add Person
          </button>
        </div>
      </form>
    </Modal>
  );
}
