type OrderLine = {
  name?: string;
  size?: string;
  quantity?: number;
  price_cents?: number;
};

export type OrderForEmail = {
  id: string;
  line_items: OrderLine[] | string;
  country: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  customer_email: string | null;
  shipping_details?: unknown;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents || 0) / 100);
}

function normalizeLines(value: OrderForEmail["line_items"]): OrderLine[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function orderEmailRecipient(order: OrderForEmail) {
  const override = process.env.RESEND_TEST_RECIPIENT?.trim();
  if (override) return override;
  return order.customer_email?.trim() || "";
}

export function buildOrderConfirmation(order: OrderForEmail) {
  const lines = normalizeLines(order.line_items);
  const orderRef = order.id.slice(0, 8).toUpperCase();
  const rows = lines.map((line) => {
    const qty = Number.isInteger(line.quantity) ? Number(line.quantity) : 1;
    const lineTotal = Number(line.price_cents || 0) * qty;
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e6dce0;">
          <div style="font-weight:700;color:#141414;">${escapeHtml(line.name || "Art print")}</div>
          <div style="font-size:13px;color:#6b5f64;">${escapeHtml(line.size || "")} · Qty ${qty}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e6dce0;text-align:right;font-weight:700;color:#141414;">${money(lineTotal)}</td>
      </tr>`;
  }).join("");

  const textLines = lines.map((line) => {
    const qty = Number.isInteger(line.quantity) ? Number(line.quantity) : 1;
    return `${line.name || "Art print"} — ${line.size || ""} × ${qty}: ${money(Number(line.price_cents || 0) * qty)}`;
  }).join("\n");

  const subject = `Order confirmed — YUZIMI #${orderRef}`;
  const text = [
    "Thank you for your order.",
    "",
    `Order: #${orderRef}`,
    textLines,
    "",
    `Subtotal: ${money(order.subtotal_cents)}`,
    `Shipping: ${order.shipping_cents === 0 ? "FREE" : money(order.shipping_cents)}`,
    `Total: ${money(order.total_cents)}`,
    "",
    "This confirmation was generated after payment was verified by Stripe.",
    "YUZIMI",
  ].filter(Boolean).join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#fff6f8;font-family:Arial,Helvetica,sans-serif;color:#141414;">
    <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffb3c4;border:3px solid #141414;padding:18px 20px;box-shadow:6px 6px 0 #141414;">
        <div style="font-size:22px;font-weight:900;letter-spacing:-0.5px;">yuzimi<span style="color:#ffffff;">ONLINE</span></div>
        <div style="margin-top:8px;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">Order confirmed</div>
      </div>

      <div style="background:#ffffff;border:2px solid #141414;margin-top:28px;padding:28px;">
        <h1 style="font-size:28px;line-height:1.1;margin:0 0 8px;">Thank you for your order.</h1>
        <p style="margin:0 0 24px;color:#6b5f64;">We've received your payment. Your order reference is <strong>#${orderRef}</strong>.</p>

        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tbody>${rows}</tbody>
        </table>

        <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:18px;">
          <tbody>
            <tr><td style="padding:6px 0;color:#6b5f64;">Subtotal</td><td style="padding:6px 0;text-align:right;">${money(order.subtotal_cents)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b5f64;">Shipping</td><td style="padding:6px 0;text-align:right;">${order.shipping_cents === 0 ? "FREE" : money(order.shipping_cents)}</td></tr>
            <tr><td style="padding:12px 0 0;font-size:18px;font-weight:900;border-top:2px solid #141414;">Total</td><td style="padding:12px 0 0;text-align:right;font-size:18px;font-weight:900;border-top:2px solid #141414;">${money(order.total_cents)}</td></tr>
          </tbody>
        </table>

        <p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:#6b5f64;">Payment was verified by Stripe before this confirmation was sent. We'll send another update when shipping notifications are enabled.</p>
      </div>

      <p style="text-align:center;font-size:11px;color:#88777e;margin-top:22px;">YUZIMI · Art prints</p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

export async function sendOrderConfirmation(order: OrderForEmail) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("Order confirmation skipped: RESEND_API_KEY is not configured.");
    return { skipped: true as const };
  }

  const to = orderEmailRecipient(order);
  if (!to) throw new Error("Order confirmation cannot be sent without a recipient email.");

  const from = process.env.RESEND_ORDER_FROM?.trim() || "yuzimiONLINE <onboarding@resend.dev>";
  const { subject, text, html } = buildOrderConfirmation(order);

  const payload: Record<string, unknown> = {
    from,
    to: [to],
    subject,
    text,
    html,
  };

  const replyTo = process.env.RESEND_REPLY_TO?.trim();
  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `order-confirmation/${order.id}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });

  const result = await response.json().catch(() => ({})) as { id?: string; message?: string; error?: { message?: string } };
  if (!response.ok || !result.id) {
    throw new Error(result.error?.message || result.message || `Resend order confirmation failed with HTTP ${response.status}.`);
  }

  return { skipped: false as const, id: result.id, recipient: to };
}
