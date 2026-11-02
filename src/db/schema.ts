import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// All money values are whole Tanzanian shillings (TZS).

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  // null = made to order (no stock limit)
  stock: integer("stock"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderItem = {
  productId: number;
  name: string;
  slug: string;
  price: number;
  size: string | null;
  quantity: number;
  image: string | null;
};

export const ORDER_STATUSES = [
  "awaiting_payment",
  "payment_submitted",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  ref: text("ref").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  deliveryMethod: text("delivery_method").notNull(),
  address: text("address").notNull().default(""),
  notes: text("notes").notNull().default(""),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  total: integer("total").notNull(),
  status: text("status").$type<OrderStatus>().notNull().default("awaiting_payment"),
  mpesaCode: text("mpesa_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const COMMISSION_STATUSES = [
  "new",
  "quoted",
  "deposit_paid",
  "in_progress",
  "ready",
  "delivered",
  "declined",
] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  ref: text("ref").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  garmentType: text("garment_type").notNull(),
  occasion: text("occasion").notNull().default(""),
  fabric: text("fabric").notNull().default(""),
  measurements: text("measurements").notNull().default(""),
  budget: integer("budget"),
  neededBy: text("needed_by"),
  details: text("details").notNull(),
  referenceImages: jsonb("reference_images").$type<string[]>().notNull().default([]),
  status: text("status").$type<CommissionStatus>().notNull().default("new"),
  quoteAmount: integer("quote_amount"),
  adminNotes: text("admin_notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
