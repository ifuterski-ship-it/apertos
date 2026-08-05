"use client";

import { useState } from "react";

export function DeleteOrderButton({ sessionId }: { sessionId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  if (deleted) {
    return (
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Order deleted — refresh to update list.</p>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="border border-red-900/40 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-red-500 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
      >
        Delete Order
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-red-400">Are you sure?</p>
      <button
        onClick={async () => {
          setIsDeleting(true);
          try {
            const res = await fetch(`/api/admin/orders/${sessionId}`, { method: "DELETE" });
            if (res.ok) setDeleted(true);
          } finally {
            setIsDeleting(false);
            setConfirming(false);
          }
        }}
        disabled={isDeleting}
        className="border border-red-500 bg-red-500 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-white transition hover:bg-red-600 disabled:opacity-40"
      >
        {isDeleting ? "Deleting..." : "Yes, Delete"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.25em] transition hover:border-white"
      >
        Cancel
      </button>
    </div>
  );
}
