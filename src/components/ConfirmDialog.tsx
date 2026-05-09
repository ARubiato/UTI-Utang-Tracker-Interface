"use client";

import Modal from "./Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
};

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-[#64748b] mb-5 leading-relaxed">{message}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-sm text-[#64748b] hover:text-[#e2e8f0] transition-colors rounded-xl hover:bg-[#1a2235]">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="px-5 py-2 text-sm font-semibold bg-[#ef4444] text-white rounded-xl hover:bg-[#dc2626] transition-colors"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
