"use client";

import { useState } from "react";
import { products } from "@/lib/products";

export function GenerateReviewLink() {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleGenerate() {
    setError(null);
    setResultUrl(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/review-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productIds: selected }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message);
      } else {
        setResultUrl(data.url);
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (resultUrl) {
      await navigator.clipboard.writeText(resultUrl);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">Customer email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
          className="mt-2 w-full rounded-[0.75rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm uppercase tracking-[0.12em] text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">Products to review</label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {products.map((p) => (
            <label
              key={p.id}
              className={`flex cursor-pointer items-center gap-3 rounded-[0.75rem] border px-4 py-3 text-xs uppercase tracking-[0.15em] transition ${
                selected.includes(p.id)
                  ? "border-white/30 bg-white/[0.08] text-white"
                  : "border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/20"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => toggle(p.id)}
                className="hidden"
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  selected.includes(p.id) ? "border-white bg-white" : "border-neutral-600"
                }`}
              >
                {selected.includes(p.id) && (
                  <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {p.name}
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-xs uppercase tracking-[0.2em] text-red-400">{error}</p>
      )}

      {resultUrl && (
        <div className="space-y-3 rounded-[1rem] border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-300">Review link generated</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={resultUrl}
              className="flex-1 rounded-[0.5rem] border border-white/10 bg-black/30 px-3 py-2 text-xs text-neutral-200"
            />
            <button
              onClick={copyLink}
              className="shrink-0 rounded-[0.5rem] border border-white/20 bg-white/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition hover:bg-white hover:text-black"
            >
              Copy
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Valid for 90 days · Single use
          </p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !email || selected.length === 0}
        className="rounded-[0.75rem] border border-white/20 bg-white/[0.06] px-6 py-3 text-[11px] uppercase tracking-[0.25em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
      >
        {loading ? "Generating…" : "Generate Review Link"}
      </button>
    </div>
  );
}
