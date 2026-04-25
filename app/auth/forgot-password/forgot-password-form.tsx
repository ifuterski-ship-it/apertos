"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://apertos.vercel.app/auth/reset-password"
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) return <p className="text-sm uppercase tracking-widest text-neutral-300">Check your email for a reset link.</p>;

  return (
    <div className="space-y-4">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-white/20 bg-transparent px-4 py-3 text-sm uppercase tracking-widest outline-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        onClick={handleSubmit}
        className="w-full border border-white px-4 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black"
      >
        Send Reset Link
      </button>
    </div>
  );
}
