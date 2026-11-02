export type Section = "clothing" | "accessories";

export type Category = {
  slug: string;
  name: string;
  section: Section;
  blurb: string;
};

// Edit this list to add or rename categories. Products store the slug.
export const CATEGORIES: Category[] = [
  { slug: "casual", name: "Everyday & Casual", section: "clothing", blurb: "Easy, handmade pieces for daily wear." },
  { slug: "batik", name: "Batik & Traditional", section: "clothing", blurb: "Hand-dyed batik, kitenge and kanga styles." },
  { slug: "linen", name: "Linen", section: "clothing", blurb: "Breathable linen made for the coast." },
  { slug: "evening", name: "Evening Wear", section: "clothing", blurb: "Gowns and statement pieces for the night." },
  { slug: "bridal", name: "Bridal", section: "clothing", blurb: "Wedding dresses and bridal party outfits." },
  { slug: "shoes", name: "Shoes", section: "accessories", blurb: "Sandals, heels and everyday shoes." },
  { slug: "handbags", name: "Handbags", section: "accessories", blurb: "Clutches, totes and woven bags." },
  { slug: "wedding-accessories", name: "Wedding Accessories", section: "accessories", blurb: "Veils, headpieces and finishing touches." },
  { slug: "watches", name: "Watches", section: "accessories", blurb: "Timepieces for every outfit." },
  { slug: "jewellery", name: "Jewellery", section: "accessories", blurb: "Beaded and metal jewellery." },
];

export function categoriesFor(section: Section) {
  return CATEGORIES.filter((c) => c.section === section);
}

export function getCategory(slug: string | undefined | null) {
  return CATEGORIES.find((c) => c.slug === slug);
}
