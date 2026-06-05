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
  colours?: string[];
  category: string;
  shortDescription: string;
  description: string;
  shippingWeightLb: number;
  sizeGuides: SizeGuideBlock[];
  material?: string;
  careInstructions?: string;
  isBestSeller?: boolean;
  isComingSoon?: boolean;
};

export const products: Product[] = [
  {
    id: "apertos-the-original-rashguard",
    name: "Apertos The Original Rashguard",
    price: 34.99,
    priceLabel: "£34.99",
    image: "/products/rashguard-back.png",
    images: ["/products/rashguard-back.png", "/products/rashguard-front.png"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    category: "Performance Top",
    shortDescription: "Compression performance essential",
    shippingWeightLb: 0.45,
    description:
      "A premium rashguard built for hard sessions, clean movement, and a sharp monochrome APERTOS finish.",
    material: "85% Polyester, 15% Spandex — 4-way stretch, moisture-wicking performance fabric",
    careInstructions: "Machine wash cold 30°C · Do not tumble dry · Hang dry · Do not iron print",
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
    price: 34.99,
    priceLabel: "£34.99",
    image: "/products/shorts-back.png",
    images: ["/products/shorts-back.png", "/products/shorts-front.png"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    category: "Training Bottoms",
    shortDescription: "Lightweight fight-ready shorts",
    shippingWeightLb: 0.55,
    description:
      "Clean, flexible shorts created for grappling and striking with a streamlined APERTOS silhouette.",
    material: "85% Polyester, 15% Spandex — lightweight 4-way stretch, quick-dry",
    careInstructions: "Machine wash cold 30°C · Do not tumble dry · Hang dry",
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
    price: 59.99,
    priceLabel: "£59.99",
    image: "/products/nogi-front.jpg",
    images: [
      "/products/nogi-front.jpg",
      "/products/nogi-back.jpg",
      "/products/nogi-lifestyle.jpeg",
      "/products/nogi-lifestyle-2.jpeg"
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    category: "Bundle",
    shortDescription: "Rashguard and shorts in one set",
    shippingWeightLb: 1,
    description:
      "A value-driven no gi set pairing the original rashguard and shorts in one refined combat-sports package.",
    material: "85% Polyester, 15% Spandex — 4-way stretch, moisture-wicking performance fabric",
    careInstructions: "Machine wash cold 30°C · Do not tumble dry · Hang dry · Do not iron print",
    isBestSeller: true,
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
  },
  {
    id: "apertos-essential-hoodie",
    name: "Apertos Essential Hoodie",
    price: 50,
    priceLabel: "£50.00",
    image: "/products/hoodie-grey-front.png",
    images: [
      "/products/hoodie-grey-front.png",
      "/products/hoodie-black-front.png",
      "/products/hoodie-grey-back.png",
      "/products/hoodie-black-back.png"
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    colours: ["Grey", "Black"],
    category: "Outerwear",
    shortDescription: "Premium combat sports hoodie",
    shippingWeightLb: 1.5,
    description:
      "A clean, heavyweight hoodie built for the gym bag, mat warm-up and everyday wear in the Apertos monochrome style.",
    material: "80% Cotton, 20% Polyester — heavyweight fleece, brushed interior",
    careInstructions: "Machine wash cold 30°C · Tumble dry low · Do not iron print",
    isComingSoon: true,
    sizeGuides: [
      {
        title: "Hoodie Size Guide",
        note: "Relaxed fit. Size down for a more fitted look.",
        rows: [
          { size: "S", chest: "38-40 in", length: "26 in" },
          { size: "M", chest: "40-42 in", length: "27 in" },
          { size: "L", chest: "42-44 in", length: "28 in" },
          { size: "XL", chest: "44-46 in", length: "29 in" },
          { size: "2XL", chest: "46-48 in", length: "30 in" }
        ]
      }
    ]
  }
];

export function getFeaturedProducts() {
  return products.filter((p) => p.id === "apertos-the-original-no-gi-set");
}

export function getApparelProducts() {
  return products.filter((p) => p.category === "Outerwear");
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}
