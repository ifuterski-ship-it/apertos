"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    if (mode === "sign-up") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsSubmitting(false);
        return;
      }

      setMessage("Account created. Check your email to confirm your account, then sign in.");
      setIsSubmitting(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/account");
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-luxe">
      <div className="mb-8 flex gap-3">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`flex-1 border px-4 py-3 text-xs uppercase tracking-[0.35em] transition ${
            mode === "sign-in" ? "border-white bg-white text-black" : "border-white/10 text-neutral-300"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`flex-1 border px-4 py-3 text-xs uppercase tracking-[0.35em] transition ${
            mode === "sign-up" ? "border-white bg-white text-black" : "border-white/10 text-neutral-300"
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
          {isSubmitting ? "Processing" : mode === "sign-up" ? "Create Account" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
