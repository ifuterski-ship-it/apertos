"use client";

import { FormEvent, useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/email/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const result = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !result.ok) {
        setError(result.message ?? "Unable to join APERTOS news right now.");
        setIsSubmitting(false);
        return;
      }

      setMessage("You’re in. Check your inbox for your APERTOS news confirmation.");
      setEmail("");
    } catch {
      setError("Unable to join APERTOS news right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.36em] text-neutral-400">Apertos News</p>
        <p className="text-[11px] uppercase leading-6 tracking-[0.24em] text-neutral-500">
          Drop updates, product news and release alerts.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email Address"
          className="min-w-0 flex-1 border border-white/10 bg-black/30 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-white outline-none transition placeholder:text-neutral-500 focus:border-white"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="border border-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.32em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Joining" : "Join"}
        </button>
      </form>
      {message ? <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">{message}</p> : null}
      {error ? <p className="text-[11px] uppercase tracking-[0.2em] text-red-300">{error}</p> : null}
    </div>
  );
}
