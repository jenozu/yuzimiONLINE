import { neon } from '@neondatabase/serverless';

export function ordersDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  return neon(process.env.DATABASE_URL);
}

export async function ensureOrdersTable() {
  const sql = ordersDb();
  await sql`CREATE TABLE IF NOT EXISTS checkout_orders (
    id text PRIMARY KEY,
    stripe_session_id text UNIQUE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    line_items jsonb NOT NULL,
    country text NOT NULL,
    subtotal_cents integer NOT NULL,
    shipping_cents integer NOT NULL,
    total_cents integer NOT NULL,
    customer_email text,
    shipping_details jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    paid_at timestamptz
  )`;
}

export async function markPaid(orderId: string, session: any) {
  if (session.payment_status !== 'paid' || session.livemode !== false || !session.id?.startsWith('cs_test_') || session.currency !== 'usd' || session.metadata?.orderId !== orderId) return false;
  const sql = ordersDb();
  const email = session.customer_details?.email || session.customer_email || null;
  const shipping = session.collected_information?.shipping_details || session.shipping_details || null;
  if (shipping?.address?.country !== session.metadata.country) return false;
  const rows = await sql`UPDATE checkout_orders
    SET status = 'paid', paid_at = COALESCE(paid_at, now()), customer_email = ${email},
        shipping_details = ${JSON.stringify(shipping)}::jsonb
    WHERE id = ${orderId} AND stripe_session_id = ${session.id}
      AND total_cents = ${session.amount_total} AND country = ${session.metadata.country}
    RETURNING id`;
  return rows.length > 0;
}
