import { neon } from "@neondatabase/serverless";
import { assertOrderTransition, type OrderStatus } from "./order-state.js";

export function ordersDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  return neon(process.env.DATABASE_URL);
}

let schemaPromise: Promise<void> | undefined;

export function ensureOrdersTable() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = ordersDb();
      await sql`CREATE TABLE IF NOT EXISTS checkout_orders (
        id text PRIMARY KEY,
        stripe_session_id text UNIQUE,
        payment_intent_id text,
        stripe_customer_id text,
        status text NOT NULL DEFAULT 'pending',
        line_items jsonb NOT NULL,
        country text NOT NULL,
        subtotal_cents integer NOT NULL,
        shipping_cents integer NOT NULL,
        total_cents integer NOT NULL,
        customer_email text,
        shipping_details jsonb,
        provider_order_id text,
        tracking_number text,
        tracking_url text,
        stripe_refund_id text,
        refunded_cents integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        paid_at timestamptz,
        fulfilled_at timestamptz,
        refunded_at timestamptz,
        cancelled_at timestamptz
      )`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS payment_intent_id text`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS stripe_customer_id text`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS provider_order_id text`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS tracking_number text`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS tracking_url text`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS stripe_refund_id text`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS refunded_cents integer NOT NULL DEFAULT 0`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS fulfilled_at timestamptz`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS refunded_at timestamptz`;
      await sql`ALTER TABLE checkout_orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz`;
      await sql`ALTER TABLE checkout_orders DROP CONSTRAINT IF EXISTS checkout_orders_status_check`;
      await sql`ALTER TABLE checkout_orders ADD CONSTRAINT checkout_orders_status_check CHECK (status IN ('pending', 'paid', 'processing', 'fulfilled', 'failed', 'expired', 'cancelled', 'refunded', 'partially_refunded', 'disputed'))`;
      await sql`CREATE INDEX IF NOT EXISTS checkout_orders_status_created_idx ON checkout_orders (status, created_at DESC)`;
      await sql`CREATE TABLE IF NOT EXISTS stripe_event_ledger (
        event_id text PRIMARY KEY,
        event_type text NOT NULL,
        stripe_object_id text,
        processed_at timestamptz NOT NULL DEFAULT now()
      )`;
    })();
  }
  return schemaPromise;
}

function expectedLiveMode() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_"));
}

export async function recordStripeEvent(eventId: string, eventType: string, objectId?: string) {
  await ensureOrdersTable();
  const sql = ordersDb();
  const rows = await sql`INSERT INTO stripe_event_ledger (event_id, event_type, stripe_object_id)
    VALUES (${eventId}, ${eventType}, ${objectId || null})
    ON CONFLICT (event_id) DO NOTHING
    RETURNING event_id`;
  return rows.length > 0;
}

export async function releaseStripeEvent(eventId: string) {
  await ensureOrdersTable();
  const sql = ordersDb();
  await sql`DELETE FROM stripe_event_ledger WHERE event_id = ${eventId}`;
}

export async function markPaid(orderId: string, session: any) {
  const live = expectedLiveMode();
  const expectedPrefix = live ? "cs_live_" : "cs_test_";
  if (
    session.payment_status !== "paid"
    || session.livemode !== live
    || !session.id?.startsWith(expectedPrefix)
    || session.currency !== "usd"
    || session.metadata?.orderId !== orderId
  ) return false;

  const shipping = session.collected_information?.shipping_details || session.shipping_details || null;
  if (shipping?.address?.country !== session.metadata.country) return false;
  const sql = ordersDb();
  const email = session.customer_details?.email || session.customer_email || null;
  const rows = await sql`UPDATE checkout_orders
    SET status = CASE WHEN status = 'pending' THEN 'paid' ELSE status END,
        paid_at = COALESCE(paid_at, now()),
        updated_at = now(),
        customer_email = COALESCE(${email}, customer_email),
        shipping_details = ${JSON.stringify(shipping)}::jsonb,
        payment_intent_id = COALESCE(${session.payment_intent || null}, payment_intent_id),
        stripe_customer_id = COALESCE(${session.customer || null}, stripe_customer_id)
    WHERE id = ${orderId}
      AND stripe_session_id = ${session.id}
      AND total_cents = ${session.amount_total}
      AND country = ${session.metadata.country}
      AND status IN ('pending', 'paid', 'processing', 'fulfilled')
    RETURNING id`;
  return rows.length > 0;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, extra?: {
  providerOrderId?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  await ensureOrdersTable();
  const sql = ordersDb();
  const currentRows = await sql`SELECT status FROM checkout_orders WHERE id = ${orderId}`;
  const current = currentRows[0]?.status as OrderStatus | undefined;
  if (!current) return null;
  assertOrderTransition(current, status);
  const rows = await sql`UPDATE checkout_orders SET
      status = ${status},
      provider_order_id = COALESCE(${extra?.providerOrderId ?? null}, provider_order_id),
      tracking_number = COALESCE(${extra?.trackingNumber ?? null}, tracking_number),
      tracking_url = COALESCE(${extra?.trackingUrl ?? null}, tracking_url),
      fulfilled_at = CASE WHEN ${status} = 'fulfilled' THEN COALESCE(fulfilled_at, now()) ELSE fulfilled_at END,
      refunded_at = CASE WHEN ${status} = 'refunded' THEN COALESCE(refunded_at, now()) ELSE refunded_at END,
      cancelled_at = CASE WHEN ${status} = 'cancelled' THEN COALESCE(cancelled_at, now()) ELSE cancelled_at END,
      updated_at = now()
    WHERE id = ${orderId} AND status = ${current}
    RETURNING *`;
  return rows[0] || null;
}

export async function recordRefund(paymentIntentId: string, refundedCents: number, refundId?: string) {
  await ensureOrdersTable();
  const sql = ordersDb();
  const rows = await sql`UPDATE checkout_orders SET
      refunded_cents = GREATEST(refunded_cents, ${refundedCents}),
      stripe_refund_id = COALESCE(${refundId || null}, stripe_refund_id),
      status = CASE WHEN ${refundedCents} >= total_cents THEN 'refunded' ELSE 'partially_refunded' END,
      refunded_at = CASE WHEN ${refundedCents} >= total_cents THEN COALESCE(refunded_at, now()) ELSE refunded_at END,
      updated_at = now()
    WHERE payment_intent_id = ${paymentIntentId}
      AND status IN ('paid', 'processing', 'fulfilled', 'cancelled', 'partially_refunded', 'disputed')
    RETURNING id`;
  return rows.length > 0;
}
