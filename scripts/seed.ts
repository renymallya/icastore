// Adds a few sample products so the shop isn't empty. Run: npm run db:seed
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db, products } = await import("../src/db");
  const samples = [
    { slug: "batik-wrap-dress", name: "Indigo Batik Wrap Dress", category: "batik", price: 85000, sizes: ["S", "M", "L", "XL"], featured: true, stock: null,
      description: "Hand-dyed cotton batik in deep indigo, cut as a flattering wrap with flutter sleeves." },
    { slug: "linen-shirt-sand", name: "Linen Camp Shirt – Sand", category: "linen", price: 65000, sizes: ["M", "L", "XL"], featured: true, stock: 6,
      description: "Breathable pure linen with coconut-shell buttons. Relaxed fit." },
    { slug: "everyday-kitenge-skirt", name: "Everyday Kitenge Midi Skirt", category: "casual", price: 45000, sizes: ["S", "M", "L"], featured: true, stock: 4,
      description: "Elastic-waist midi skirt in bright kitenge print, with pockets." },
    { slug: "evening-satin-gown", name: "Emerald Satin Evening Gown", category: "evening", price: 220000, sizes: ["S", "M", "L"], featured: true, stock: null,
      description: "Floor-length bias-cut satin gown, made to order." },
    { slug: "beaded-bridal-clutch", name: "Beaded Bridal Clutch", category: "wedding-accessories", price: 55000, sizes: [], featured: false, stock: 3,
      description: "Hand-beaded ivory clutch with detachable chain." },
  ];
  await db().insert(products).values(samples).onConflictDoNothing({ target: products.slug });
  console.log(`Seeded ${samples.length} products (existing slugs skipped).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
