import { redirect } from "next/navigation";
import { SignOutButton } from "@/app/account/sign-out-button";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  if (!hasSupabaseEnv) {
    redirect("/auth");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Account</p>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Welcome Back</h1>
        <p className="mt-4 text-sm uppercase tracking-[0.2em] text-neutral-300">{user.email}</p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-muted">Profile</p>
          <p className="text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
            Your APERTOS account is active. Additional profile, order history, and member tools can be added here next.
          </p>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
