# yuzimiONLINE

yuzimiONLINE is a React and TypeScript storefront for made-to-order art prints. Products, images, size variants, and checkout orders are managed through a private admin area. The production deployment uses Vercel, Neon PostgreSQL, Cloudflare R2, and Stripe Checkout.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- A Neon PostgreSQL database
- A Cloudflare R2 bucket and scoped object read/write credentials
- A Stripe account for checkout testing

## Local setup

1. Install dependencies with npm ci.
2. Copy .env.example to .env.local.
3. Add development credentials to .env.local. Never commit this file.
4. Apply db/schema.sql to the Neon database.
5. Start the storefront with npm run dev.

Vite serves the storefront locally. The api/ directory contains Vercel Functions and requires either a linked Vercel development environment or compatible environment variables to exercise locally.

## Required environment variables

| Variable | Purpose |
|---|---|
| DATABASE_URL | Neon PostgreSQL connection string |
| R2_ACCOUNT_ID | Cloudflare account ID |
| R2_ACCESS_KEY_ID | Scoped R2 access-key ID |
| R2_SECRET_ACCESS_KEY | Scoped R2 secret |
| R2_BUCKET_NAME | Product-image bucket |
| ADMIN_PASSWORD | Admin login password |
| ADMIN_SESSION_SECRET | Random secret used to sign admin sessions |
| STRIPE_SECRET_KEY | Stripe test secret until live checkout is approved |
| STRIPE_WEBHOOK_SECRET | Signing secret for the deployed Stripe webhook |

R2_PUBLIC_URL and a Stripe publishable key are not required by the current server-proxied image and hosted-checkout implementation.

## Quality checks

Run npm run verify before pushing. It performs TypeScript validation, unit tests, and the production build. Use npm run test:e2e for Playwright storefront checks.

Pull requests run type checking, unit tests, and a production build automatically.

## Database setup

db/schema.sql is the canonical schema for fresh environments. API functions also use idempotent CREATE TABLE IF NOT EXISTS and additive migration statements so existing deployments can gain newly introduced columns safely.

For a fresh environment:

1. Create a Neon project and database.
2. Open the Neon SQL editor.
3. Run the complete contents of db/schema.sql.
4. Set the resulting pooled connection string as DATABASE_URL.

## Cloudflare R2 setup

Create a bucket dedicated to product images and an API token restricted to object read/write access for that bucket. The application stores randomized object keys under products/ and serves them through /api/products/image; R2 credentials are never sent to the browser.

## Stripe test setup

Keep Stripe in test mode until the checkout milestone is verified.

Operational guides:

- [Prelaunch runbook](docs/PRELAUNCH_RUNBOOK.md)
- [Print asset guide](docs/PRINT_ASSET_GUIDE.md)
- [Support procedures](docs/SUPPORT_PROCEDURES.md)
- [Security review](docs/SECURITY_REVIEW.md)

1. Add the Stripe test secret key to Vercel.
2. Register https://YOUR_DOMAIN/api/stripe-webhook as a test webhook.
3. Subscribe to checkout completion, asynchronous success, asynchronous failure, expiration, refund, and dispute events supported by the order state machine.
4. Store the endpoint signing secret as STRIPE_WEBHOOK_SECRET.
5. Redeploy before testing.

Never fulfill an order based only on the browser success page. Fulfillment must use the server-recorded paid state.

## Deployment

The production project is deployed from the default GitHub branch through Vercel.

1. Import the repository as a Vite project.
2. Keep the repository root as the Vercel root directory.
3. Add environment variables separately for Preview and Production.
4. Deploy and inspect the function logs for database, R2, or Stripe errors.

Changing an environment variable requires a new deployment.

## Recovery

### Database

Use Neon restore/branching features to restore into a separate recovery branch first. Compare product and order counts before promoting or copying recovered data. Never overwrite the current production branch without a verified recovery point.

### Product images

Keep R2 object versioning or an external bucket backup enabled. Database image rows contain the R2 object keys required to reconnect restored objects.

### Application

Vercel deployments are immutable. If a release fails, use Vercel rollback or promotion controls to return to the last known-good deployment, then revert or fix the Git commit on the default branch.

### Credentials

If a credential may have been exposed, rotate it at the service provider, update the corresponding Vercel environment variable, and redeploy. Do not paste secret values into issues, screenshots, logs, or commits.

## Roadmap

The canonical project roadmap is master_plan.md. Checklist items are only marked complete after the implementation and relevant verification are both present.
