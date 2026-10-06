# yuzimiONLINE — Launch MVP

This is the **active launch roadmap** for YUZIMI. Its purpose is to get `yuzimi.online` safely accepting real art-print orders as quickly as possible.

The larger `master_plan.md` remains the long-term backlog. Items listed under **Deferred until after launch** are intentionally excluded from launch progress and must not block opening the store.

## Launch rule

Launch when a real customer can:
1. Visit `https://yuzimi.online`.
2. Browse a real published print.
3. Choose a size and see the correct price.
4. Add it to cart and see the correct shipping charge.
5. Pay successfully through Stripe.
6. Create a paid order in YUZIMI.
7. Receive an order-confirmation email.
8. Give us enough order/shipping information to fulfill the print reliably.

No post-launch optimization should delay those eight things.

---

## MVP 1 — Stable storefront

### Goal
Use the recovered storefront as the launch baseline and verify the core buying experience still works.

- [x] Storefront, product, cart, support, admin and checkout-result routes exist <!-- task:YUZ-LMVP-001 -->
- [x] Neon PostgreSQL is integrated for product/catalog data <!-- task:YUZ-LMVP-002 -->
- [x] Cloudflare R2 is integrated for product images <!-- task:YUZ-LMVP-003 -->
- [x] Password-protected admin and product-management APIs exist <!-- task:YUZ-LMVP-004 -->
- [x] Product variants support the eight launch print sizes and per-size pricing <!-- task:YUZ-LMVP-005 -->
- [ ] Verify the deployed production catalog loads real products, including the existing Bayonetta listing <!-- task:YUZ-LMVP-006 -->
- [ ] Verify deployed admin login, product editing, R2 images, add-to-cart and cart refresh behavior <!-- task:YUZ-LMVP-007 -->

**Milestone complete when:** the recovered deployed storefront can be managed and shopped without a broken core flow.

---

## MVP 2 — Domain and HTTPS

### Goal
Make the purchased custom domain the real storefront address.

- [x] Add `yuzimi.online` to the existing Vercel project <!-- task:YUZ-LMVP-008 -->
- [x] Add `www.yuzimi.online` and redirect it to the apex domain <!-- task:YUZ-LMVP-009 -->
- [ ] Remove the old Namecheap URL-forwarding rule and apply the DNS records Vercel provides <!-- task:YUZ-LMVP-010 -->
- [ ] Verify HTTPS works without certificate warnings on both apex and `www` <!-- task:YUZ-LMVP-011 -->
- [ ] Make `https://yuzimi.online` the canonical production URL everywhere the app needs an absolute storefront URL <!-- task:YUZ-LMVP-012 -->
  - Code support is ready: canonical metadata was added in PR #7 and `PUBLIC_STORE_URL=https://yuzimi.online` is now configured in Vercel Production. Keep open until DNS/HTTPS are verified.

**Milestone complete when:** both domain variants securely land on the production store and the apex domain is canonical.

---

## MVP 3 — Launch catalog and storefront

### Goal
Show only real art-print products and remove anything obviously unfinished from the customer journey.

- [x] Storefront is art-print-only and uses the YUZIMI visual system <!-- task:YUZ-LMVP-013 -->
- [x] Product cards show series/category and starting price <!-- task:YUZ-LMVP-014 -->
- [x] Product pages support gallery images, descriptions, size selection and variant pricing <!-- task:YUZ-LMVP-015 -->
- [x] Mobile layout, header/cart spacing and the 4 × 2 size grid are implemented <!-- task:YUZ-LMVP-016 -->
- [x] Remove remaining placeholder products, mock data, dead links and temporary customer-facing copy <!-- task:YUZ-LMVP-017 -->
  - PR #7 removed mock Lookbook/Archive routes and launch-facing apparel/utility placeholder copy.
- [ ] Confirm launch products have final title, series, description, images, alt text and prices <!-- task:YUZ-LMVP-018 -->
- [ ] Verify all header, footer, FAQ, support and policy links on desktop and mobile <!-- task:YUZ-LMVP-019 -->

**Milestone complete when:** a customer sees a clean, real catalog with no obvious placeholders or broken navigation.

---

## MVP 4 — Checkout and paid-order integrity

### Goal
Prove the complete payment flow before switching to live charges.

- [x] Size-aware cart items, quantity controls and subtotal calculation exist <!-- task:YUZ-LMVP-020 -->
- [x] Stripe Checkout Sessions use server-validated database prices <!-- task:YUZ-LMVP-021 -->
- [x] Pending checkout orders are stored in Neon before redirecting to Stripe <!-- task:YUZ-LMVP-022 -->
- [x] Success/cancel routes and a signed Stripe webhook handler exist <!-- task:YUZ-LMVP-023 -->
- [ ] Configure/verify Stripe **test-mode** secret and webhook environment variables in Vercel <!-- task:YUZ-LMVP-024 -->
- [ ] Register and verify the deployed `/api/stripe-webhook` endpoint in Stripe test mode <!-- task:YUZ-LMVP-025 -->
- [ ] Complete an end-to-end test purchase: checkout → payment → webhook HTTP 200 → paid order → cart cleared <!-- task:YUZ-LMVP-026 -->
- [ ] Confirm duplicate/retried Stripe events cannot create duplicate paid orders <!-- task:YUZ-LMVP-027 -->
  - PR #7 made the paid transition idempotent in code; keep open until a deployed Stripe retry test passes.
- [ ] Activate/configure Stripe live mode only after the test flow passes <!-- task:YUZ-LMVP-028 -->
- [ ] Make one controlled low-value live purchase and refund before opening the store publicly <!-- task:YUZ-LMVP-029 -->

**Milestone complete when:** YUZIMI can safely turn one real Stripe payment into exactly one paid order.

---

## MVP 5 — Shipping, fulfillment and customer communication

### Goal
Ensure every paid order can actually be produced, shipped and communicated to the buyer.

- [x] Current shipping-rate logic exists for the supported launch regions <!-- task:YUZ-LMVP-030 -->
- [ ] Choose/document the launch print provider and fulfillment method <!-- task:YUZ-LMVP-031 -->
- [ ] Confirm the launch print sizes, paper/finish requirements and provider pricing <!-- task:YUZ-LMVP-032 -->
- [ ] Confirm launch shipping regions and validate their rates against the provider; reduce to US-only at launch if that is the fastest reliable option <!-- task:YUZ-LMVP-033 -->
- [ ] Ensure fulfillment cannot begin unless the order is marked paid <!-- task:YUZ-LMVP-034 -->
- [ ] Verify `yuzimi.online` in Resend with the required SPF/DKIM records <!-- task:YUZ-LMVP-035 -->
  - Order-email code is merged in PR #8; DNS verification still requires the Resend/Namecheap setup.
- [ ] Configure the production sender `yuzimiONLINE <orders@yuzimi.online>` and a restricted Resend key in Vercel <!-- task:YUZ-LMVP-036 -->
  - Environment-variable support and setup documentation are merged; production values still need to be set in Vercel.
- [ ] Complete a Stripe test purchase that sends the branded order-confirmation email exactly once <!-- task:YUZ-LMVP-037 -->
  - PR #8 added persistent email-delivery state plus a Resend idempotency key; CI passes. Keep open until deployed delivery is tested.
- [ ] Confirm there is a monitored customer-support email/contact path visible on the site <!-- task:YUZ-LMVP-038 -->
  - PR #9 replaced the fake contact-form success state with a real Resend-backed endpoint. Set `SUPPORT_INBOX` in Vercel and test delivery before checking this off.

**Milestone complete when:** a paid order can be produced/shipped and the buyer receives a reliable confirmation/support path.

---

## MVP 6 — Minimum legal, security and launch acceptance

### Goal
Do the minimum responsible pre-launch work without turning the MVP into an enterprise project.

- [ ] Publish final Privacy Policy, Terms of Service, Shipping Policy and Return/Refund Policy that match the real launch process <!-- task:YUZ-LMVP-039 -->
- [ ] Add the business/support contact details required for the storefront <!-- task:YUZ-LMVP-040 -->
- [ ] Rotate any production credential known to have appeared in a screenshot, chat, log or commit <!-- task:YUZ-LMVP-041 -->
- [x] Verify customer-facing/API errors do not expose passwords, cookies, database URLs or secret keys <!-- task:YUZ-LMVP-042 -->
  - PR #7 replaced unexpected server errors with generic customer-facing responses; CI passed.
- [x] Add basic abuse protection to admin login and checkout creation if not already present <!-- task:YUZ-LMVP-043 -->
  - PR #7 added lightweight throttling for admin login and checkout creation.
- [ ] Run final desktop and mobile smoke tests from landing page through product → cart → checkout → paid order → email <!-- task:YUZ-LMVP-044 -->
- [ ] Record the production deployment/commit used for launch and a simple rollback point <!-- task:YUZ-LMVP-045 -->
- [ ] Open the store publicly only after all launch-blocking tasks above pass <!-- task:YUZ-LMVP-046 -->

**Milestone complete when:** the real storefront has passed the buying journey and minimum launch-safety checks.

---

## Deferred until after launch

The following are still useful, but **must not count against Launch MVP completion** unless a launch test reveals that one is required:

- Full admin order-management dashboard.
- Variant inventory quantities for made-to-order prints.
- Product archiving/history UX.
- Automated shipping-confirmation email.
- Internal paid-order and dispute alerts.
- Customer order lookup/status portal.
- Automated refund/cancellation controls.
- Full Stripe dispute/partial-refund state machine.
- Provider API automation and fulfillment retries.
- International expansion beyond the launch regions.
- Advanced address validation.
- Full unit/API/browser test suites beyond launch-critical regression checks.
- Cross-browser/device matrix testing beyond the main desktop/mobile smoke tests.
- Full accessibility audit.
- Core Web Vitals optimization.
- Advanced image optimization.
- Structured-data SEO.
- Analytics and conversion funnels.
- Application/error monitoring platform.
- Monthly dependency/security/disaster-recovery reviews.
- Post-launch conversion, abandonment, refund and defect analysis.

---

## Current priority

Work strictly in this order unless a blocker forces a temporary skip:

1. **MVP 1:** verify the recovered deployed storefront.
2. **MVP 2:** connect and verify `yuzimi.online`.
3. **MVP 4 test-mode checkout:** webhook + paid-order acceptance.
4. **MVP 5 email:** verify Resend and send a real test confirmation.
5. **MVP 3:** finish/remove launch catalog placeholders.
6. **MVP 5 fulfillment/shipping:** lock provider and launch regions.
7. **MVP 6:** legal/security smoke pass.
8. **MVP 4 live mode:** one controlled live purchase/refund.
9. **Launch.**

Do not add new feature work to this file unless it is required for one of the eight launch rules at the top.
