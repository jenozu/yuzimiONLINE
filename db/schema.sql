CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  category text NOT NULL DEFAULT 'Art Print',
  badge text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  object_key text NOT NULL UNIQUE,
  alt text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  available boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  UNIQUE (product_id, size)
);

CREATE INDEX IF NOT EXISTS products_status_created_idx ON products (status, created_at DESC);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images (product_id, position);
CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants (product_id, position);

CREATE TABLE IF NOT EXISTS checkout_orders (
  id text PRIMARY KEY,
  stripe_session_id text UNIQUE,
  payment_intent_id text,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'fulfilled', 'failed', 'expired', 'cancelled', 'refunded', 'partially_refunded', 'disputed')),
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
);

CREATE INDEX IF NOT EXISTS checkout_orders_status_created_idx ON checkout_orders (status, created_at DESC);

CREATE TABLE IF NOT EXISTS stripe_event_ledger (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  stripe_object_id text,
  processed_at timestamptz NOT NULL DEFAULT now()
);
