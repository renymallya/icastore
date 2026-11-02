# icastore

Online shop for handmade clothing (everyday, batik/traditional, linen, evening, bridal) and accessories (shoes, handbags, wedding accessories, watches, jewellery), with custom-order commissions and M-Pesa Lipa Namba payment.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Neon Postgres (Drizzle ORM) · Vercel Blob (images) · Resend (email) · hosted on Vercel.

## What's in it

| Area | Path | Notes |
|---|---|---|
| Home | `/` | Collections, featured products, custom-order banner |
| Clothing | `/shop?category=batik` | Categories in `src/lib/catalog.ts` |
| Accessories | `/accessories?category=shoes` | Shoes, handbags, wedding accessories, watches, jewellery |
| Product | `/product/[slug]` | Sizes, stock or “made to order”, “request a custom version” link |
| Cart / checkout | `/cart`, `/checkout` | Cart in browser storage; prices re-checked on the server |
| Payment | `/order/[ref]` | Lipa Namba instructions, customer submits M-Pesa transaction code |
| Custom orders | `/commission` | Form with measurements and inspiration photo upload |
| Admin | `/admin` | Products and photos, verify payments, manage custom orders |

### How Lipa Namba payment works

Lipa Namba is a till number with no automatic callback, so payment is confirmed by hand:

1. The customer places an order and gets an order reference (e.g. `ICA-7KQ2M9XA`).
2. The order page shows your Lipa Namba, business name and exact amount. The customer pays from their phone.
3. The customer pastes the M-Pesa transaction code from their SMS. You get an email.
4. You check the code on your M-Pesa statement, then click **Confirm payment received** in `/admin/orders`. The customer is emailed.

Stock for limited items is reserved when the order is placed and returned if you cancel it.
To make confirmation automatic later, see [Automatic M-Pesa confirmation](#later-automatic-m-pesa-confirmation).

---

## 1. Run it locally

```bash
# Node 22+ required
npm install
cp .env.example .env.local   # or use `vercel env pull` after step 3
npm run dev                  # http://localhost:3000
```

## 2. Create the Vercel project

1. Push this repo to GitHub (`renymallya/icastore`).
2. In Vercel: **Add New… → Project → Import** `icastore`. Framework is detected as Next.js; leave the defaults.
3. Deploy once. It builds, but pages that read the database show an error until step 3 is done.
4. **Settings → Functions → Function Region**: choose **Frankfurt (fra1)**. Use the same region for Neon below; it is the closest well-supported region to East Africa.

## 3. Database: Neon Postgres

1. In the Vercel project: **Storage → Create Database → Neon (Serverless Postgres) → Continue**.
2. Accept the Neon integration, pick region **AWS Europe Central 1 (Frankfurt)**, plan **Free**, name it `icastore`.
3. **Connect** it to the project for *Production*, *Preview* and *Development*. Vercel adds `DATABASE_URL` (and a few `POSTGRES_*`/`PG*` variables this app doesn't use).
   - Optional: enable “Create database branch for each preview deployment” so test deploys never touch real orders.
4. Pull the variables and create the tables from your machine:

```bash
npm i -g vercel
vercel login
vercel link              # choose the icastore project
vercel env pull .env.local
npm run db:push          # creates products, orders, commissions tables
npm run db:seed          # optional: 5 sample products to see the layout
```

Run `npm run db:push` again whenever you change `src/db/schema.ts`. `npm run db:studio` opens a browser view of the data.

## 4. Images: Vercel Blob

1. **Storage → Create Database → Blob**, name `icastore-images`, access **Public**, and connect it to all environments. Vercel adds `BLOB_READ_WRITE_TOKEN`.
2. `vercel env pull .env.local` again.

Photos go straight from the browser to Blob through `/api/upload`, so large phone photos don't hit Vercel's 4.5 MB request limit. Only a signed-in admin can upload product photos. Anyone can upload commission inspiration photos, limited to images of 8 MB or less under `commissions/`.

## 5. Your domain

1. Vercel project → **Settings → Domains → Add** `icastore.co.tz` (replace with your real domain) and `www.icastore.co.tz`.
2. Either:
   - **Use Vercel DNS (simplest):** at your registrar, change nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`. All DNS records below are then added in Vercel → **Domains → (domain) → DNS Records**.
   - **Keep DNS at your registrar:** add the records Vercel shows. Usually that is an `A` record on `@` pointing to Vercel's IP and a `CNAME` on `www` pointing to Vercel's target. Use the exact values on that screen.
3. Set `NEXT_PUBLIC_SITE_URL=https://icastore.co.tz` in Vercel env vars. It is used in email links.

## 6. Email from your domain: Resend

Resend sends the order, payment and custom-order emails.

1. Sign up at resend.com, then **Domains → Add Domain** → `icastore.co.tz`. Choose region **eu-west-1 (Ireland)**.
2. Resend shows about four DNS records. Add them exactly as shown, where your DNS lives (step 5):

   | Type | Name | Purpose |
   |---|---|---|
   | MX | `send` | bounce handling (on the `send` subdomain, so it won't affect your mailbox) |
   | TXT | `send` | SPF: `v=spf1 include:amazonses.com ~all` |
   | TXT | `resend._domainkey` | DKIM key (long value, copy exactly) |
   | TXT | `_dmarc` | Recommended: `v=DMARC1; p=none; rua=mailto:you@icastore.co.tz` |

3. Click **Verify**. It usually completes within minutes, but can take a few hours on some registrars.
4. **API Keys → Create** (permission: *Sending access*, domain: icastore.co.tz). Add it to Vercel as `RESEND_API_KEY`.
5. Set `EMAIL_FROM="icastore <orders@icastore.co.tz>"` and `OWNER_EMAIL` (where alerts go).

**Receiving email** (a real `info@icastore.co.tz` inbox) is separate from sending. Use Zoho Mail (free tier), Google Workspace or Microsoft 365, and add *their* MX records on the root `@`. They don't conflict with Resend's records on `send`.

## 7. Environment variables

Set these in Vercel → **Settings → Environment Variables**, then redeploy.

| Variable | Set by | Example |
|---|---|---|
| `DATABASE_URL` | Neon integration | — |
| `BLOB_READ_WRITE_TOKEN` | Blob store | — |
| `RESEND_API_KEY` | you | `re_…` |
| `EMAIL_FROM` | you | `icastore <orders@icastore.co.tz>` |
| `OWNER_EMAIL` | you | where new-order alerts go |
| `ADMIN_PASSWORD` | you | long password for `/admin` |
| `ADMIN_SESSION_SECRET` | you | output of `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | you | `https://icastore.co.tz` |
| `NEXT_PUBLIC_LIPA_NAMBA` | you | your Lipa Namba |
| `NEXT_PUBLIC_LIPA_NAME` | you | business name the customer sees on M-Pesa |
| `NEXT_PUBLIC_WHATSAPP` | you | `2557XXXXXXXX` (optional) |

`NEXT_PUBLIC_*` values are compiled in at build time, so redeploy after changing them.

## 8. Day to day

- **Add products:** `/admin/products` → Add product → upload photos (the first one is the main image). Leave *Stock* blank for made-to-order items.
- **Payments:** `/admin` shows *Payments to verify*. Match the code to your M-Pesa statement, then confirm.
- **Custom orders:** `/admin/commissions`. Call or WhatsApp the customer, record your quote and update the status as work progresses.
- **Edit categories, delivery fees or payment wording:** `src/lib/catalog.ts` and `src/lib/config.ts`.

## Later: automatic M-Pesa confirmation

To have payments confirm themselves instead of checking codes by hand, you need an API-enabled collection account rather than a plain Lipa Namba:

- **Vodacom M-Pesa Open API** (openapiportal.m-pesa.com): C2B / customer-to-business push. Requires business onboarding with Vodacom.
- **Payment aggregators** such as Selcom, AzamPay or ClickPesa: one integration that also covers Mixx by Yas (Tigo Pesa), Airtel Money and HaloPesa, and sends a USSD push prompt to the customer's phone.

Both send a callback to a webhook. You would add a route like `/api/payments/callback` that sets the order to `paid`. The rest of the app stays the same.
