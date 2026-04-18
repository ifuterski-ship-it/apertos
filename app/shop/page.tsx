import { ProductGrid } from "@/components/products/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { products } from "@/lib/products";

export default function ShopPage() {
  return (
    <div className="space-y-10 pb-24">
      <SectionHeading
        eyebrow="Shop"
        title="The Apertos Collection"
        description="A focused three-piece drop with premium styling, clean imagery, and simple local cart functionality."
      />
      <ProductGrid products={products} />
    </div>
  );
}
