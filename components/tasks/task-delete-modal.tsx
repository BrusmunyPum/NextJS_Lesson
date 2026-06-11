"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";

type TaskDeleteModalProps = {
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function TaskDeleteModal({
  taskTitle,
  isOpen,
  onClose,
  onConfirm,
}: TaskDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Task">
      <p className="text-sm text-slate-300">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-white">"{taskTitle}"</span>?
        This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
