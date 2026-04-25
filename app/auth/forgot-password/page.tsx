"use client";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md space-y-8 px-4 py-24">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.45em] text-neutral-400">Account</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em]">Reset Password</h1>
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
          Enter your email and we will send you a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}