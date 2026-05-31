"use client";

import { useState } from "react";

export function WaitlistForm({ product }: { product: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product })
      });

      const data = await res.json();

      if (data.ok) {
        setState("success");
      } else {
        setErrorMessage(data.message ?? "Something went wrong.");
        setState("error");
      }
    } catch {
      setErrorMessage("Unable to sign up right now. Please try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-300">
          You will be notified when the hoodie drops
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
      <p className="mb-4 text-xs uppercase tracking-[0.45em] text-muted">Notify Me When Available</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="min-h-[48px] flex-1 border border-white/15 bg-transparent px-4 text-sm uppercase tracking-[0.18em] text-white placeholder:text-neutral-600 focus:border-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="min-h-[48px] shrink-0 border border-white/20 px-5 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-300 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "loading" ? "..." : "Notify Me"}
        </button>
      </form>
      {state === "error" ? (
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-red-300">{errorMessage}</p>
      ) : null}
    </div>
  );
}
