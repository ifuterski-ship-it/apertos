import { redirect } from "next/navigation";
import { AuthForm } from "@/app/auth/auth-form";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function AuthPage() {
  if (!hasSupabaseEnv) {
    return (
      <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Account</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Auth Not Configured</h1>
        <p className="max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Add your Supabase environment variables locally or use the deployed site where Supabase is configured.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/account");
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Account</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Join Apertos</h1>
        <p className="mx-auto max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Create an account to manage your profile and access future member features.
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
