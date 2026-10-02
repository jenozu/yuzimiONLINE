# YUZIMI transactional email setup

YUZIMI uses Resend for order-confirmation emails. During the temporary test phase, messages are sent from Resend's testing sender rather than a YUZIMI-owned domain.

## Temporary test configuration

Set these Vercel environment variables for Production (and Preview if you test previews):

- `RESEND_API_KEY`: a Resend sending-only API key.
- `RESEND_ORDER_FROM`: `yuzimiONLINE <onboarding@resend.dev>`
- `RESEND_TEST_RECIPIENT`: the store owner's test inbox.
- `RESEND_REPLY_TO`: optional; leave blank until a monitored support inbox is ready.

Keep `RESEND_TEST_RECIPIENT` set while using the Resend test sender. This prevents test checkouts from sending confirmations to arbitrary checkout addresses.

After changing Vercel environment variables, create a fresh deployment.

## How confirmations are triggered

1. Stripe sends `checkout.session.completed` or `checkout.session.async_payment_succeeded` to `/api/stripe-webhook`.
2. The webhook verifies Stripe's signature and requires a test-mode checkout session.
3. The order is reconciled against the server-side order total and marked paid.
4. Only then does the server call Resend.
5. The Resend request uses `order-confirmation/<order-id>` as its idempotency key, reducing duplicate sends when Stripe retries the same event.

A missing `RESEND_API_KEY` skips email sending without changing payment state. A configured Resend request that fails returns a webhook error so Stripe can retry.

## Test acceptance

Use Stripe test mode and a test checkout. Confirm all of the following:

- YUZIMI success page shows `TEST PAYMENT RECEIVED`.
- Stripe shows the test payment as successful.
- Stripe webhook delivery returns HTTP 200.
- The order-confirmation email arrives at `RESEND_TEST_RECIPIENT`.
- The email has the correct order reference, print, size, quantity, subtotal, shipping and total.
- Retrying the same Stripe webhook does not create an immediate duplicate confirmation.

Do not use live Stripe keys while the test sender is active.

## Switching to a YUZIMI domain later

After purchasing the YUZIMI domain:

1. Add the domain to Resend.
2. Add Resend's SPF/DKIM DNS records at the registrar and verify the domain.
3. Create a domain-scoped sending API key, then replace `RESEND_API_KEY` in Vercel.
4. Change `RESEND_ORDER_FROM` to an address such as `yuzimiONLINE <orders@your-domain.example>`.
5. Remove `RESEND_TEST_RECIPIENT` so confirmations go to the paid order's Stripe customer email.
6. Optionally set `RESEND_REPLY_TO` to a monitored support address.
7. Redeploy and perform one test-mode purchase before enabling real payments.

Before live launch, add persistent application-level email delivery state/outbox handling in addition to Resend's temporary idempotency window.
