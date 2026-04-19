import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] transition duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          <div className="absolute inset-0 p-8 md:p-10">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="object-contain transition duration-500 group-hover:scale-[1.04]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">{product.category}</p>
            <h3 className="font-display text-3xl uppercase tracking-[0.08em]">{product.name}</h3>
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-neutral-300">{product.shortDescription}</p>
            <p className="mt-2 text-lg font-semibold">{product.priceLabel}</p>
          </div>
          <Link
            href={`/product/${product.id}`}
            className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] transition hover:border-white hover:bg-white hover:text-black"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}
