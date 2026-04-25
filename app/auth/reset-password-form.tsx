"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState(");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError("Invalid or expired reset link. Please request a new password reset.");
          setSessionValid(false);
        } else {
          setSessionValid(true);
        }
      } catch (err) {
        setError("Error verifying reset link. Please try again.");
        setSessionValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [supabase.auth]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        setIsSubmitting(false);
        return;
      }

      setMessage("Password updated successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/auth");
        router.refresh();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update password.";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-luxe text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-300">Loading...</p>
      </div>
    );
  }

  if (!sessionValid) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-luxe">
        <p className="text-sm uppercase tracking-[0.18em] text-red-300 mb-4">{error}</p>
        <a
          href="/auth"
          className="inline-block border border-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
        >
          Back to Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-luxe">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="password" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
            placeholder="Enter new password"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
            placeholder="Confirm new password"
          />
        </div>

        {message ? <p className="text-sm uppercase tracking-[0.18em] text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm uppercase tracking-[0.18em] text-red-300">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full border border-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating Password" : "Update Password"}
        </button>
      </form>
    </div>
  );
}