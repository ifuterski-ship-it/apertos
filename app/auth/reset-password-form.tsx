"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
  }

  if (done) return <p className="text-sm uppercase tracking-widest text-neutral-300">Password updated! You can now sign in.</p>;

  return (
    <div className="space-y-4">
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-white/20 bg-transparent px-4 py-3 text-sm uppercase tracking-widest outline-none"
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full border border-white/20 bg-transparent px-4 py-3 text-sm uppercase tracking-widest outline-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        onClick={handleSubmit}
        className="w-full border border-white px-4 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black"
      >
        Update Password
      </button>
    </div>
  );
}