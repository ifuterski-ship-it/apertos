"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/components/cart/cart-provider";
import { NewsletterSignup } from "@/components/marketing/newsletter-signup";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart", label: "Cart" },
  { href: "/contact", label: "Contact" }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { totalItems, isHydrated } = useCart();
  const { totalItems: wishlistTotal } = useWishlist();

  if (pathname?.startsWith('/vortex')) {
    return <>{children}</>;
  }
  const supabase = useMemo(() => (hasSupabaseEnv ? createClient() : null), []);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(currentUser);
      }
    };

    loadUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/15 bg-black">
              <Image src="/logo-mark.png" alt="Apertos logo" fill sizes="44px" className="object-cover opacity-90" />
            </div>
            <span className="font-display text-lg uppercase tracking-[0.28em] sm:text-2xl sm:tracking-[0.45em]">
              Apertos
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs uppercase tracking-[0.3em] text-neutral-300 transition hover:text-white",
                  (link.href === "/cart" || link.href === "/wishlist") && "inline-flex items-center gap-2"
                )}
              >
                {link.label}
                {link.href === "/wishlist" ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-white/15 px-2 py-1 text-[10px]">
                    <Heart className="h-3.5 w-3.5" />
                    <span className="sr-only">Items in wishlist</span>
                    <span className="ml-1">{isHydrated ? wishlistTotal : 0}</span>
                  </span>
                ) : null}
                {link.href === "/cart" ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-white/15 px-2 py-1 text-[10px]">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span className="sr-only">Items in cart</span>
                    <span className="ml-1">{isHydrated ? totalItems : 0}</span>
                  </span>
                ) : null}
              </Link>
            ))}
            <Link
              href={user ? "/account" : "/auth"}
              className="text-xs uppercase tracking-[0.3em] text-neutral-300 transition hover:text-white"
              >
                {user ? "Account" : "Login"}
              </Link>
          </nav>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center border border-white/10 p-3 text-white transition hover:border-white/40 md:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-white/10 bg-black/95 md:hidden">
            <nav className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between border border-white/10 px-4 py-4 text-xs uppercase tracking-[0.3em] text-neutral-300 transition hover:border-white/40 hover:text-white"
                >
                  <span>{link.label}</span>
                  {link.href === "/wishlist" ? (
                    <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-white/15 px-2 py-1 text-[10px]">
                      <Heart className="h-3.5 w-3.5" />
                      <span className="ml-1">{isHydrated ? wishlistTotal : 0}</span>
                    </span>
                  ) : null}
                  {link.href === "/cart" ? (
                    <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-white/15 px-2 py-1 text-[10px]">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span className="ml-1">{isHydrated ? totalItems : 0}</span>
                    </span>
                  ) : null}
                </Link>
              ))}

              <Link
                href={user ? "/account" : "/auth"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="border border-white/10 px-4 py-4 text-xs uppercase tracking-[0.3em] text-neutral-300 transition hover:border-white/40 hover:text-white"
              >
                {user ? "Account" : "Login"}
              </Link>

              <a
                href="https://www.tiktok.com/@apertos.fightwear"
                target="_blank"
                rel="noreferrer"
                className="px-1 pt-2 text-center text-[11px] uppercase tracking-[0.32em] text-neutral-500 transition hover:text-white"
              >
                TikTok @apertos.fightwear
              </a>
            </nav>
          </div>
        ) : null}
      </header>
      <div className="border-b border-white/10 bg-white/[0.02] py-2.5">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.35em] text-neutral-400">
            <span>Free UK Shipping Over £40</span>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="hidden sm:inline">Secure Checkout</span>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="hidden sm:inline">Easy Returns</span>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="hidden sm:inline">UK-Based Brand</span>
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">{children}</main>
      <footer className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 border-t border-white/10 px-4 py-8 text-xs uppercase tracking-[0.28em] text-neutral-400 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-black">
              <Image src="/logo-mark.png" alt="Apertos logo" fill sizes="40px" className="object-cover opacity-70" />
            </div>
            <span>Premium Combat Sports</span>
          </div>
          <NewsletterSignup />
        </div>
        <div className="flex flex-col gap-3 text-left lg:items-end lg:text-right">
          <a
            href="https://www.tiktok.com/@apertos.fightwear"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            @apertos.fightwear
          </a>
          <span>Apertos Est. 2026</span>
        </div>
      </footer>
    </div>
  );
}
