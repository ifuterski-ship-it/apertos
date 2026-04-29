import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/app/auth/forgot-password/forgot-password-form";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export default async function ForgotPasswordPage() {
  if (!hasSupabaseEnv) {
    redirect("/auth");
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Account Recovery</p>
        <p className="mx-auto max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Reset your APERTOS password securely with Supabase email recovery.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
