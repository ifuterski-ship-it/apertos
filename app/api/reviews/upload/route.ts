import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { getReviewToken } from "@/lib/reviews";

export const runtime = "nodejs";

const MAX_FILES = 3;
const MAX_BYTES = 15 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif"
]);

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov"
};

export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv) {
    return NextResponse.json({ ok: false, message: "Uploads unavailable." }, { status: 500 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const token = form.get("token");
  if (typeof token !== "string" || !token) {
    return NextResponse.json({ ok: false, message: "Missing token." }, { status: 400 });
  }

  const reviewToken = await getReviewToken(token);
  if (!reviewToken) {
    return NextResponse.json({ ok: false, message: "Invalid review link." }, { status: 404 });
  }
  if (reviewToken.usedAt) {
    return NextResponse.json({ ok: false, message: "This review link has already been used." }, { status: 409 });
  }
  if (new Date(reviewToken.expiresAt) < new Date()) {
    return NextResponse.json({ ok: false, message: "This review link has expired." }, { status: 410 });
  }

  const files = form.getAll("files").filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ ok: false, message: "No files selected." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ ok: false, message: `Maximum of ${MAX_FILES} files per review.` }, { status: 400 });
  }

  for (const file of files) {
    const type = file.type.toLowerCase();
    const allowed = IMAGE_TYPES.has(type) || VIDEO_TYPES.has(type);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: "Unsupported file type. Use JPG, PNG, WEBP, GIF, MP4 or MOV." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: "Each photo or video must be under 15MB." },
        { status: 400 }
      );
    }
  }

  const supabase = createAdminClient();

  try {
    await supabase.storage.createBucket("review-media", { public: true });
  } catch {
    // Bucket already exists
  }

  const urls: string[] = [];

  for (const file of files) {
    const type = file.type.toLowerCase();
    const extension = EXTENSIONS[type] ?? ".bin";
    const storagePath = `${token}/${randomBytes(16).toString("hex")}${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("review-media")
      .upload(storagePath, buffer, {
        contentType: type || "application/octet-stream",
        cacheControl: "31536000"
      });

    if (error) {
      console.warn("Review media upload failed:", error.message);
      return NextResponse.json({ ok: false, message: "Upload failed. Please try again." }, { status: 500 });
    }

    const { data } = supabase.storage.from("review-media").getPublicUrl(storagePath);
    urls.push(data.publicUrl);
  }

  return NextResponse.json({ ok: true, urls });
}