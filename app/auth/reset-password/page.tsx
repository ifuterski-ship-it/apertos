import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/app/auth/reset-password/reset-password-form";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export default function ResetPasswordPage() {
  if (!hasSupabaseEnv) {
    redirect("/auth");
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Secure Reset</p>
        <p className="mx-auto max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Use the recovery link from your email to set a new APERTOS password.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
