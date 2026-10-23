"use client";

import { useState } from "react";

type EmailCustomerButtonProps = {
  sessionId: string;
  email: string | null;
};

export function EmailCustomerButton({ sessionId, email }: EmailCustomerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [to, setTo] = useState(email ?? "");
  const [subject, setSubject] = useState("Your APERTOS order");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = async () => {
    setStatus(null);

    if (!to.trim() || !subject.trim() || !message.trim()) {
      setStatus("Add a recipient, subject and message.");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`/api/admin/orders/${sessionId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message })
      });

      const result = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !result.ok) {
        setStatus(result.message ?? "Unable to send the email right now.");
        return;
      }

      setStatus("Email sent.");
      setMessage("");
    } catch {
      setStatus("Unable to reach the email service right now.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.3em] transition hover:border-white hover:bg-white hover:text-black"
      >
        Email Customer
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.35em] text-muted">Email Customer</p>
      <label className="block space-y-1">
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">To</span>
        <input
          type="email"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="w-full border border-white/10 bg-transparent px-3 py-2 text-xs tracking-[0.08em] text-white outline-none focus:border-white/40"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Subject</span>
        <input
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="w-full border border-white/10 bg-transparent px-3 py-2 text-xs tracking-[0.08em] text-white outline-none focus:border-white/40"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Message</span>
        <textarea
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full border border-white/10 bg-transparent px-3 py-2 text-xs leading-6 tracking-[0.04em] text-white outline-none focus:border-white/40"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className="border border-white px-4 py-3 text-xs uppercase tracking-[0.3em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "Sending" : "Send Email"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setStatus(null);
          }}
          disabled={isSending}
          className="border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.3em] transition hover:border-white/40 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
      <p className="text-[10px] uppercase leading-5 tracking-[0.18em] text-neutral-500">
        Sent from orders@apertosfightwear.com. Replies go to business@apertosfightwear.com.
      </p>
      {status ? <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-300">{status}</p> : null}
    </div>
  );
}
