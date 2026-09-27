# Security review

Last code review: 2026-09-27.

## Implemented controls

- Admin sessions are signed, HTTP-only, Secure, SameSite=Strict cookies with a 12-hour lifetime.
- Admin mutations and checkout creation require a matching request origin.
- Login, upload, admin writes, checkout, and checkout-status routes have application-level rate limits.
- Product prices and availability are loaded from Neon on the server; browser totals are not trusted.
- Stripe webhook signatures, timestamp tolerance, mode, event IDs, session IDs, order IDs, amount, currency, and shipping country are checked.
- Stripe event IDs are claimed in an idempotency ledger; a failed handler releases its claim for a retry.
- Uploads enforce byte limit, allowed MIME, image signature/type match, dimensions, and randomized `products/` object keys.
- Public errors are generic for unexpected failures, and security headers/CSP are configured in `vercel.json`.
- Products are archived instead of hard-deleted so historical line items remain usable.

## Deployment checks still required

- Replace the in-memory rate limiter with a shared durable limiter if abuse appears or traffic spans many function instances.
- Review production headers and CSP in a real browser after deployment.
- Rotate exposed credentials and enable MFA/least privilege on GitHub, Vercel, Neon, R2, Stripe, and email.
- Configure error monitoring with redaction and alerting.
- Complete dependency scanning and recurring backup/restore exercises.

## Logging rule

Never log request bodies for login, cookies, authorization headers, database URLs, R2/Stripe secrets, webhook signatures, full addresses, or payment data. Use request/event/order IDs for correlation and keep customer data out of routine error messages.
