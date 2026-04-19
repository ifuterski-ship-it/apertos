import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .map(normalizeEmail);
}

export function hasAdminEmailsConfigured() {
  return getAdminEmails().length > 0;
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(normalizeEmail(email));
}

export async function requireAdminUser() {
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

  if (hasAdminEmailsConfigured() && !isAdminEmail(user.email)) {
    redirect("/account");
  }

  return user;
}
