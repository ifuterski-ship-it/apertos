import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-sm uppercase tracking-[0.4em] text-muted">404</p>
      <h1 className="font-display text-4xl uppercase tracking-[0.08em]">Product Not Found</h1>
      <Link
        href="/shop"
        className="border border-white px-5 py-3 text-xs uppercase tracking-[0.35em] transition hover:bg-white hover:text-black"
      >
        Return To Shop
      </Link>
    </div>
  );
}
