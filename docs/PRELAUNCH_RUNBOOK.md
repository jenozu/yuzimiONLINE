# yuzimiONLINE prelaunch runbook

Use this checklist in order. Record the date, operator, and evidence link for every completed item. Do not enable live payments until every blocking check passes.

## 1. Release candidate

- [ ] Freeze catalog and application changes for the launch window.
- [ ] Confirm the intended commit is on `main` and both GitHub Actions workflows pass.
- [ ] Run `npm ci`, `npm run verify`, and `npm run test:e2e` locally or in CI.
- [ ] Confirm the Vercel production deployment matches the intended commit.
- [ ] Test home, collections, one product, cart, support, and legal pages at mobile, tablet, and desktop widths.

## 2. Catalog and artwork

- [ ] Confirm every published item has a final title, series, description, badge, and useful image alt text.
- [ ] Confirm all eight size prices and availability toggles.
- [ ] Verify print-ready artwork against `docs/PRINT_ASSET_GUIDE.md`; storefront previews must not be treated as production files.
- [ ] Place one test item in draft and confirm it is absent from the storefront.
- [ ] Archive one disposable test item and confirm historical order data remains intact.

## 3. Data and storage

- [ ] Export Neon products, variants, images, and orders; store the encrypted export outside the production account.
- [ ] Create a Neon recovery branch and restore the export there.
- [ ] Compare table row counts and open representative products/orders before declaring the backup usable.
- [ ] Confirm new uploads reach R2, storefront image proxy responses return the correct MIME type, and deleted draft uploads can be removed.
- [ ] Confirm R2 lifecycle, account access, and billing alerts are appropriate.

## 4. Stripe

- [ ] Complete test purchases for the United States, Canada, United Kingdom, and each active European rate group.
- [ ] Test success, cancellation, decline, expiration, duplicate webhook delivery, refund, and dispute states.
- [ ] Confirm Stripe session amount, currency, shipping country, and line items reconcile with the Neon order.
- [ ] Confirm the admin order queue can move a paid order to processing and fulfilled with tracking.
- [ ] Confirm Preview uses test keys and cannot create live charges.
- [ ] Complete Stripe account verification, merchant name, statement descriptor, support details, tax decision, and refund policy.
- [ ] Add live keys only after approval; make one low-value live purchase and full refund.

## 5. Fulfillment and shipping

- [ ] Approve provider, paper, finish, bleed, color profile, print dimensions, packaging, and turnaround time.
- [ ] Complete and inspect physical samples for every paper/finish combination.
- [ ] Reconcile provider shipping rates against `lib/checkout/shipping.ts`.
- [ ] Confirm the Europe exception list, duties/VAT copy, address validation, and undeliverable-address procedure.
- [ ] Test mixed sizes, multiple quantities, edge destinations, provider rejection, and manual recovery.

## 6. Customer communication

- [ ] Configure a verified email sending domain and monitored support inbox.
- [ ] Add `VITE_SUPPORT_EMAIL` to Vercel and test the support contact action.
- [ ] Verify paid-order confirmation, shipping confirmation, and internal alert templates.
- [ ] Follow `docs/SUPPORT_PROCEDURES.md` in a tabletop test for damage, loss, cancellation, refund, and address change.

## 7. Legal, privacy, and security

- [ ] Obtain owner/legal approval for Terms, Privacy, Shipping, and Return policies plus seller disclosures.
- [ ] Replace every placeholder address or legal contact with verified business information.
- [ ] Rotate credentials that appeared in screenshots, chat, logs, or prior commits.
- [ ] Review Vercel logs for secret leakage and confirm security headers on production responses.
- [ ] Confirm data retention/deletion policy and account access for Neon, R2, Stripe, Vercel, GitHub, and email.

## 8. Domain, monitoring, and rollback

- [ ] Connect the custom domain; verify HTTPS, canonical URL, `www`/apex redirects, sitemap, and robots directives.
- [ ] Configure privacy-conscious analytics and error alerts for API, database, R2, Stripe, and checkout failures.
- [ ] Record the previous stable Vercel deployment and test the rollback procedure.
- [ ] Assign launch-day ownership for orders, failed checkouts, fulfillment, support, and incident response.

## 9. Go/no-go

Launch only when the owner explicitly approves the release candidate, policies, fulfillment workflow, payment mode, and rollback plan. After launch, review orders and alerts daily for the first week and complete the 30-day operating review in the master plan.
