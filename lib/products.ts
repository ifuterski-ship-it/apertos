export type SizeGuideRow = {
  size: string;
  chest?: string;
  waist?: string;
  length?: string;
};

export type SizeGuideBlock = {
  title: string;
  note: string;
  rows: SizeGuideRow[];
};

export type Product = {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  image: string;
  images?: string[];
  sizes: string[];
  category: string;
  shortDescription: string;
  description: string;
  sizeGuides: SizeGuideBlock[];
};

export const products: Product[] = [
  {
    id: "apertos-the-original-rashguard",
    name: "Apertos The Original Rashguard",
    price: 29.99,
    priceLabel: "\u00A329.99",
    image: "/products/rashguard-back.png",
    images: ["/products/rashguard-back.png", "/products/rashguard-front.png"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    category: "Performance Top",
    shortDescription: "Compression performance essential",
    description:
      "A premium rashguard built for hard sessions, clean movement, and a sharp monochrome APERTOS finish.",
    sizeGuides: [
      {
        title: "Rashguard Size Guide",
        note: "Measured for a compression fit. Size up for a more relaxed feel.",
        rows: [
          { size: "S", chest: "34-36 in", length: "25 in" },
          { size: "M", chest: "36-38 in", length: "26 in" },
          { size: "L", chest: "38-40 in", length: "27 in" },
          { size: "XL", chest: "40-42 in", length: "28 in" },
          { size: "2XL", chest: "42-44 in", length: "29 in" }
        ]
      }
    ]
  },
  {
    id: "apertos-the-original-shorts",
    name: "Apertos The Original Shorts",
    price: 29.99,
    priceLabel: "\u00A329.99",
    image: "/products/shorts-back.png",
    images: ["/products/shorts-back.png", "/products/shorts-front.png"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    category: "Training Bottoms",
    shortDescription: "Lightweight fight-ready shorts",
    description:
      "Clean, flexible shorts created for grappling and striking with a streamlined APERTOS silhouette.",
    sizeGuides: [
      {
        title: "Shorts Size Guide",
        note: "Waist measurements are based on the elastic waistband at its natural resting fit.",
        rows: [
          { size: "S", waist: "28-30 in", length: "16.5 in" },
          { size: "M", waist: "30-32 in", length: "17 in" },
          { size: "L", waist: "32-34 in", length: "17.5 in" },
          { size: "XL", waist: "34-36 in", length: "18 in" },
          { size: "2XL", waist: "36-38 in", length: "18.5 in" }
        ]
      }
    ]
  },
  {
    id: "apertos-the-original-no-gi-set",
    name: "Apertos The Original No Gi Set",
    price: 49.99,
    priceLabel: "\u00A349.99",
    image: "/products/nogi-front.jpg",
    images: ["/products/nogi-front.jpg", "/products/nogi-back.jpg"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    category: "Bundle",
    shortDescription: "Rashguard and shorts in one set",
    description:
      "A value-driven no gi set pairing the original rashguard and shorts in one refined combat-sports package.",
    sizeGuides: [
      {
        title: "Rashguard Size Guide",
        note: "Compression top measurements for the set.",
        rows: [
          { size: "S", chest: "34-36 in", length: "25 in" },
          { size: "M", chest: "36-38 in", length: "26 in" },
          { size: "L", chest: "38-40 in", length: "27 in" },
          { size: "XL", chest: "40-42 in", length: "28 in" },
          { size: "2XL", chest: "42-44 in", length: "29 in" }
        ]
      },
      {
        title: "Shorts Size Guide",
        note: "Waist and outseam measurements for the shorts in the set.",
        rows: [
          { size: "S", waist: "28-30 in", length: "16.5 in" },
          { size: "M", waist: "30-32 in", length: "17 in" },
          { size: "L", waist: "32-34 in", length: "17.5 in" },
          { size: "XL", waist: "34-36 in", length: "18 in" },
          { size: "2XL", waist: "36-38 in", length: "18.5 in" }
        ]
      }
    ]
  }
];

export function getFeaturedProducts() {
  return products;
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}
