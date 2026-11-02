export const store = {
  name: "icastore",
  tagline: "Handmade clothing, made in Tanzania",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  lipaNamba: process.env.NEXT_PUBLIC_LIPA_NAMBA ?? "",
  lipaName: process.env.NEXT_PUBLIC_LIPA_NAME ?? "ICASTORE",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "",
};

// Delivery options shown at checkout. Fees are in TZS.
export const DELIVERY_OPTIONS = [
  { id: "pickup", label: "Pick up from studio", fee: 0 },
  { id: "dar", label: "Delivery within Dar es Salaam", fee: 5000 },
  { id: "upcountry", label: "Delivery outside Dar es Salaam (bus parcel)", fee: 15000 },
] as const;

export type DeliveryId = (typeof DELIVERY_OPTIONS)[number]["id"];

// Steps shown on the payment page. Check the wording against your M-Pesa menu.
export const LIPA_STEPS = [
  "Dial *150*00# and choose “Lipa kwa M-Pesa”, or open the M-Pesa app and tap “Lipa”.",
  "Choose “Weka Lipa Namba” and enter the Lipa Namba below.",
  "Enter the exact amount shown, then your M-Pesa PIN.",
  "Confirm the name shows as the business name below before sending.",
  "Copy the transaction code from the M-Pesa SMS and paste it into the form on this page.",
];
