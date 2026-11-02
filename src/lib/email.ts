import "server-only";
import { Resend } from "resend";
import type { Commission, Order } from "@/db/schema";
import { store } from "./config";
import { formatTZS } from "./format";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "icastore <onboarding@resend.dev>";
const OWNER = process.env.OWNER_EMAIL;

// Email is best-effort: a failed send is logged and never blocks an order.
async function send(to: string | undefined | null, subject: string, html: string) {
  if (!to) return;
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set; skipped "${subject}" to ${to}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html: layout(html),
      replyTo: OWNER,
    });
    if (error) console.error("[email] send failed", error);
  } catch (err) {
    console.error("[email] send threw", err);
  }
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function layout(body: string) {
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2b3418">
  <h1 style="font-weight:normal;letter-spacing:.08em;color:#556b2f">${store.name}</h1>
  ${body}
  <p style="color:#5f6748;font-size:13px;margin-top:32px">${store.tagline}<br>${store.siteUrl}</p>
</div>`;
}

function itemsTable(order: Order) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td>${esc(i.name)}${i.size ? ` (${esc(i.size)})` : ""} × ${i.quantity}</td><td align="right">${formatTZS(i.price * i.quantity)}</td></tr>`,
    )
    .join("");
  return `<table width="100%" cellpadding="4" style="border-collapse:collapse">${rows}
  <tr><td>Delivery</td><td align="right">${formatTZS(order.deliveryFee)}</td></tr>
  <tr><td><b>Total</b></td><td align="right"><b>${formatTZS(order.total)}</b></td></tr></table>`;
}

const orderLink = (order: Order) => `${store.siteUrl}/order/${order.ref}`;

export async function sendOrderPlaced(order: Order) {
  await send(
    order.email,
    `Your icastore order ${order.ref} – payment details`,
    `<p>Hi ${esc(order.customerName)}, thank you for your order.</p>
     ${itemsTable(order)}
     <p>Pay <b>${formatTZS(order.total)}</b> via M-Pesa Lipa Namba <b>${esc(store.lipaNamba)}</b> (${esc(store.lipaName)}),
     then enter your M-Pesa transaction code here: <a href="${orderLink(order)}">${orderLink(order)}</a></p>`,
  );
  await send(
    OWNER,
    `New order ${order.ref} – ${formatTZS(order.total)}`,
    `<p>${esc(order.customerName)} · ${esc(order.phone)} · ${esc(order.deliveryMethod)}</p>${itemsTable(order)}
     <p><a href="${store.siteUrl}/admin/orders">Open admin</a></p>`,
  );
}

export async function sendPaymentSubmitted(order: Order) {
  await send(
    OWNER,
    `Payment submitted for ${order.ref}: ${order.mpesaCode}`,
    `<p>${esc(order.customerName)} (${esc(order.phone)}) says they paid <b>${formatTZS(order.total)}</b>.</p>
     <p>M-Pesa code: <b>${esc(order.mpesaCode ?? "")}</b>. Check your M-Pesa statement, then confirm in
     <a href="${store.siteUrl}/admin/orders">admin</a>.</p>`,
  );
}

export async function sendOrderStatus(order: Order) {
  const messages: Partial<Record<Order["status"], string>> = {
    paid: "We have received your payment and started preparing your order.",
    shipped: "Your order is on its way.",
    delivered: "Your order has been delivered. Enjoy, and thank you for supporting handmade.",
    cancelled: "Your order has been cancelled. Reply to this email if this is unexpected.",
  };
  const msg = messages[order.status];
  if (!msg) return;
  await send(
    order.email,
    `icastore order ${order.ref}: ${order.status}`,
    `<p>Hi ${esc(order.customerName)},</p><p>${msg}</p><p><a href="${orderLink(order)}">View your order</a></p>`,
  );
}

export async function sendCommissionReceived(c: Commission) {
  await send(
    c.email,
    `We received your custom request ${c.ref}`,
    `<p>Hi ${esc(c.name)}, thank you for your custom ${esc(c.garmentType)} request.</p>
     <p>We will review your details and contact you on ${esc(c.phone)} with a quote and timeline.
     Your reference is <b>${c.ref}</b>.</p>`,
  );
  await send(
    OWNER,
    `New commission ${c.ref}: ${c.garmentType}`,
    `<p>${esc(c.name)} · ${esc(c.phone)} · ${esc(c.email ?? "no email")}</p>
     <p><b>Occasion:</b> ${esc(c.occasion)}<br><b>Needed by:</b> ${esc(c.neededBy ?? "-")}<br>
     <b>Budget:</b> ${c.budget ? formatTZS(c.budget) : "-"}</p>
     <p>${esc(c.details)}</p>
     <p><a href="${store.siteUrl}/admin/commissions">Open admin</a></p>`,
  );
}
