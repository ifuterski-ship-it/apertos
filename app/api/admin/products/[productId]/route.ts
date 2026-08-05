import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { setProductFlag } from "@/lib/product-flags";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  if (!hasSupabaseEnv) {
    return NextResponse.json({ ok: false, message: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { productId } = await params;
  const { comingSoon } = (await request.json()) as { comingSoon: boolean };

  const ok = await setProductFlag(productId, comingSoon);

  if (!ok) {
    return NextResponse.json({ ok: false, message: "Failed to update product flag." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
