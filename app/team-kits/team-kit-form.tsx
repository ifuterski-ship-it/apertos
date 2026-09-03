"use client";

import { FormEvent, useState } from "react";

const KIT_PRODUCTS = ["Rash Guards", "Hoodies", "MMA Shorts"];

type KitLine = { product: string; quantity: string; notes: string };

const initialLine = (): KitLine => ({ product: KIT_PRODUCTS[0], quantity: "", notes: "" });

export function TeamKitForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [club, setClub] = useState("");
  const [lines, setLines] = useState<KitLine[]>([initialLine()]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateLine = (index: number, patch: Partial<KitLine>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const addLine = () => setLines((prev) => [...prev, initialLine()]);

  const removeLine = (index: number) => {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const response = await fetch("/api/team-kit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, club, kitLines: lines, message })
    });

    const result = (await response.json()) as { ok?: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setStatus(result.message ?? "Unable to send your kit enquiry right now.");
      setIsSubmitting(false);
      return;
    }

    setStatus("Kit enquiry sent. We will be in touch shortly.");
    setName("");
    setEmail("");
    setClub("");
    setLines([initialLine()]);
    setMessage("");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-luxe">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="kit-name" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Name
          </label>
          <input
            id="kit-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="kit-email" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Email
          </label>
          <input
            id="kit-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="kit-club" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Team / Club Name
        </label>
        <input
          id="kit-club"
          value={club}
          onChange={(event) => setClub(event.target.value)}
          className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
        />
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">What do you need? (min. 10 per item)</p>
        {lines.map((line, index) => (
          <div key={index} className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="min-w-40 flex-1 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Product</label>
              <select
                value={line.product}
                onChange={(event) => updateLine(index, { product: event.target.value })}
                className="w-full border border-white/10 bg-black px-3 py-4 text-sm text-white outline-none transition focus:border-white"
              >
                {KIT_PRODUCTS.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Quantity</label>
              <input
                type="number"
                min="10"
                required
                value={line.quantity}
                onChange={(event) => updateLine(index, { quantity: event.target.value })}
                className="w-full border border-white/10 bg-black/30 px-3 py-4 text-sm text-white outline-none transition focus:border-white"
              />
            </div>
            <div className="min-w-40 flex-1 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Notes / Colours</label>
              <input
                value={line.notes}
                onChange={(event) => updateLine(index, { notes: event.target.value })}
                className="w-full border border-white/10 bg-black/30 px-3 py-4 text-sm text-white outline-none transition focus:border-white"
              />
            </div>
            <button
              type="button"
              onClick={() => removeLine(index)}
              disabled={lines.length === 1}
              className="border border-white/10 px-3 py-4 text-xs uppercase tracking-[0.2em] text-neutral-400 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addLine}
          className="border border-white/15 px-4 py-3 text-xs uppercase tracking-[0.25em] text-neutral-300 transition hover:border-white hover:text-white"
        >
          + Add Item
        </button>
      </div>

      <div className="space-y-2">
        <label htmlFor="kit-message" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Anything else?
        </label>
        <textarea
          id="kit-message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
        />
      </div>

      {status ? <p className="text-sm uppercase tracking-[0.18em] text-neutral-300">{status}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full border border-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending" : "Send Kit Enquiry"}
      </button>
    </form>
  );
}
