"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit() {
    const supabase = createClient();
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
    }
    router.push("/account");
  }

  return (
    <div className="space-y-4">
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-white/20 bg-transparent px-4 py-3 text-sm uppercase tracking-widest outline-none" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-white/20 bg-transparent px-4 py-3 text-sm uppercase tracking-widest outline-none" />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button onClick={handleSubmit}
        className="w-full border border-white px-4 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black">
        {isSignUp ? "Create Account" : "Sign In"}
      </button>
      <button onClick={() => setIsSignUp(!isSignUp)}
        className="w-full text-xs uppercase tracking-widest text-neutral-400">
        {isSignUp ? "Already have an account? Sign in" : "No account? Create one"}
      </button>
      <a href="/auth/forgot-password"
        className="block text-center text-xs uppercase tracking-widest text-neutral-400 hover:text-white">
        Forgot Password?
      </a>
    </div>
  );
}
