import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const response = NextResponse.redirect(new URL("/auth/reset-password", request.url));

  if (code) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    });

    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
