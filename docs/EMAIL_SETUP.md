# YUZIMI transactional email setup

YUZIMI uses Resend for order-confirmation emails. The production sending domain is now `yuzimi.online`.

## Domain + HTTPS order of operations

1. Connect `yuzimi.online` to the Vercel project and wait until Vercel shows **Valid Configuration**.
2. Verify that both `https://yuzimi.online` and `https://www.yuzimi.online` resolve as intended and that Vercel has automatically provisioned SSL.
3. Add `yuzimi.online` to Resend.
4. Add Resend's exact SPF/DKIM records to the same DNS zone at Namecheap. These records can coexist with the Vercel A/CNAME records.
5. Wait until Resend reports the domain verified for sending.
6. Create a Resend **sending-only** API key restricted to `yuzimi.online`.

## Vercel email environment variables

Set these for Production (and Preview if you test previews):

- `RESEND_API_KEY`: the Resend sending-only API key.
- `RESEND_ORDER_FROM`: `yuzimiONLINE <orders@yuzimi.online>`
- `RESEND_TEST_RECIPIENT`: the store owner's test inbox while validating order emails.
- `RESEND_REPLY_TO`: optional; set only to a monitored inbox.

Keep `RESEND_TEST_RECIPIENT` while testing. Remove it only after email delivery is verified and you want confirmations to go to each Stripe customer email.

After changing Vercel environment variables, create a fresh deployment.

## How confirmations are triggered

1. Stripe sends `checkout.session.completed` or `checkout.session.async_payment_succeeded` to `/api/stripe-webhook`.
2. The webhook verifies Stripe's signature and requires a test-mode checkout session.
3. The order is reconciled against the server-side order total and marked paid.
4. Only then does the server call Resend.
5. YUZIMI records successful confirmation delivery on the order and uses `order-confirmation/<order-id>` as the Resend idempotency key. Stripe retries therefore do not intentionally send a second confirmation.

A missing `RESEND_API_KEY` skips email sending without changing payment state. A configured Resend request that fails returns a webhook error so Stripe can retry.

## Test acceptance

Use Stripe test mode and a test checkout. Confirm all of the following:

- YUZIMI success page shows `TEST PAYMENT RECEIVED`.
- Stripe shows the test payment as successful.
- Stripe webhook delivery returns HTTP 200.
- The order-confirmation email arrives at `RESEND_TEST_RECIPIENT`.
- The email is sent from `orders@yuzimi.online`.
- The email has the correct order reference, print, size, quantity, subtotal, shipping and total.
- Retrying the same Stripe webhook does not create an immediate duplicate confirmation.

Keep Stripe in test mode until these checks pass.

## Going live later

After the custom domain and order email are verified:

1. Remove `RESEND_TEST_RECIPIENT` so confirmations go to the paid order's Stripe customer email.
2. Optionally set `RESEND_REPLY_TO` to a monitored support address.
3. Update Stripe's webhook endpoint to the custom domain only after `https://yuzimi.online/api/stripe-webhook` is confirmed working. Avoid leaving duplicate active endpoints longer than necessary.
4. Perform another test-mode purchase through `https://yuzimi.online` before enabling real payments.

YUZIMI stores `confirmation_email_sent_at` and `confirmation_email_id` on the checkout order after Resend accepts the message. A retry skips orders already recorded as sent; the Resend idempotency key also protects the narrow case where the email was accepted but the database update did not complete.

## Support contact form

The storefront Contact tab posts to `/api/support-contact`; it no longer displays a fake success state.

Configure:

- `SUPPORT_INBOX`: the monitored private inbox that should receive customer support messages.
- `RESEND_SUPPORT_FROM`: recommended value `yuzimiONLINE Support <support@yuzimi.online>`.

The customer's address is set as the Resend reply-to address, so staff can reply normally from the monitored inbox. The endpoint validates input, includes a honeypot field, and throttles repeated submissions. Test the form after the Resend domain is verified and the environment variables are deployed.
