"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeRecovery = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!mounted) return;
        if (exchangeError) {
          setError("This reset link is invalid or has expired. Request a new password reset email.");
          return;
        }
        setIsReady(true);
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setIsReady(true);
        return;
      }

      setError("This reset link is invalid or has expired. Request a new password reset email.");
    };

    initializeRecovery();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Your new password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("Password updated. Redirecting you back to your account...");

    window.setTimeout(() => {
      router.push("/account");
      router.refresh();
    }, 1200);
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-luxe">
      <div className="mb-8 space-y-3">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Recovery</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">Reset Password</h1>
        <p className="text-sm uppercase leading-7 tracking-[0.18em] text-neutral-300">
          Choose a new password for your APERTOS account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="reset-password" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            New Password
          </label>
          <input
            id="reset-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="reset-password-confirm" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Confirm Password
          </label>
          <input
            id="reset-password-confirm"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
          />
        </div>

        {message ? <p className="text-sm uppercase tracking-[0.18em] text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm uppercase tracking-[0.18em] text-red-300">{error}</p> : null}

        <button
          type="submit"
          disabled={!isReady || isSubmitting}
          className="w-full border border-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving Password" : "Set New Password"}
        </button>
      </form>
    </div>
  );
}
