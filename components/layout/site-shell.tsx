"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/components/cart/cart-provider";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/contact", label: "Contact" }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const { totalItems, isHydrated } = useCart();
  const supabase = useMemo(() => (hasSupabaseEnv ? createClient() : null), []);
  const [user, setUser] = useState<User | null>(null);

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
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-4">
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/15 bg-black">
              <Image src="/logo-mark.png" alt="Apertos logo" fill sizes="44px" className="object-cover opacity-90" />
            </div>
            <span className="font-display text-2xl uppercase tracking-[0.45em]">Apertos</span>
          </Link>
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs uppercase tracking-[0.3em] text-neutral-300 transition hover:text-white",
                  link.href === "/cart" && "inline-flex items-center gap-2"
                )}
              >
                {link.label}
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
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">{children}</main>
      <footer className="mx-auto mt-8 flex w-full max-w-7xl items-center justify-between border-t border-white/10 px-4 py-8 text-xs uppercase tracking-[0.28em] text-neutral-400 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-black">
            <Image src="/logo-mark.png" alt="Apertos logo" fill sizes="40px" className="object-cover opacity-70" />
          </div>
          <span>Premium Combat Sports</span>
        </div>
        <span>Apertos Est. 2026</span>
      </footer>
    </div>
  );
}
