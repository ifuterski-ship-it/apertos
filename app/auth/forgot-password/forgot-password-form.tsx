"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { absoluteUrl } from "@/lib/site";

export function ForgotPasswordForm() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: absoluteUrl("/auth/reset-password")
    });

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("Password reset sent. Check your inbox for the secure reset link.");
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-luxe">
      <div className="mb-8 space-y-3">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Recovery</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">Forgot Password</h1>
        <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
          Enter your email and we&apos;ll send you a secure reset link for your APERTOS account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="forgot-email" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
          />
        </div>

        {message ? <p className="text-sm uppercase tracking-[0.18em] text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm uppercase tracking-[0.18em] text-red-300">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full border border-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending Reset Link" : "Send Reset Link"}
        </button>
      </form>

      <Link
        href="/auth"
        className="mt-6 inline-flex text-xs uppercase tracking-[0.3em] text-neutral-400 transition hover:text-white"
      >
        Back To Login
      </Link>
    </div>
  );
}
