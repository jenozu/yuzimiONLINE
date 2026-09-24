# yuzimiONLINE — Master Plan

This roadmap tracks the work required to take yuzimiONLINE from its current working storefront to a production-ready art-print shop. A checked task means the capability is present in the repository; launch verification and live payment/fulfillment work remain unchecked until they are actually completed.

## M1: Storefront foundation

### Goal
Maintain a deployable storefront with production services configured safely.

### Implementation
- [x] Create the React, TypeScript, and Vite storefront repository <!-- task:YUZ-M1-001 -->
- [x] Connect the main branch to the Vercel project <!-- task:YUZ-M1-002 -->
- [x] Configure client-side routes for storefront, product, support, admin, and checkout-result pages <!-- task:YUZ-M1-003 -->
- [x] Connect Neon PostgreSQL for product data <!-- task:YUZ-M1-004 -->
- [x] Connect Cloudflare R2 for product image storage <!-- task:YUZ-M1-005 -->
- [x] Add a sanitized `.env.example` covering database, storage, admin, and Stripe settings <!-- task:YUZ-M1-006 -->
- [x] Keep service credentials in Vercel environment variables instead of Git <!-- task:YUZ-M1-007 -->
- [x] Confirm uploaded R2 images render on the deployed storefront <!-- task:YUZ-M1-008 -->
- [ ] Document local setup, database setup, deployment, and recovery steps in the repository README <!-- task:YUZ-M1-009 -->
  - Include required Node version and install, lint, build, and development commands.
  - Explain how to apply the database schema and configure Neon, R2, Stripe, and Vercel without exposing secrets.
- [ ] Add automated CI for type checking and production builds on every pull request <!-- task:YUZ-M1-010 -->
  - Require the checks to pass before merging to main.

## M2: Art-print catalog and admin

### Goal
Manage the entire print catalog without editing source code or calling an AI service.

### Implementation
- [x] Add password-protected admin login and signed session cookies <!-- task:YUZ-M2-001 -->
- [x] Add authenticated admin APIs for listing, creating, updating, and deleting products <!-- task:YUZ-M2-002 -->
- [x] Add authenticated image upload and delete APIs backed by Cloudflare R2 <!-- task:YUZ-M2-003 -->
- [x] Store products, product images, and product variants in Neon <!-- task:YUZ-M2-004 -->
- [x] Support draft and published product states <!-- task:YUZ-M2-005 -->
- [x] Provide eight print-size price fields: 8 × 10, 11 × 14, 12 × 18, 16 × 20, 18 × 24, 20 × 30, 24 × 32, and 24 × 36 inches <!-- task:YUZ-M2-006 -->
- [x] Allow multiple product images with ordering and alt text <!-- task:YUZ-M2-007 -->
- [x] Use the catalog category field as the anime or series name <!-- task:YUZ-M2-008 -->
- [x] Remove AI-generated descriptions and keep product copy manually editable <!-- task:YUZ-M2-009 -->
- [x] Make the admin product form usable on mobile screens <!-- task:YUZ-M2-010 -->
- [ ] Add inventory or availability controls for each print variant <!-- task:YUZ-M2-011 -->
  - Decide whether variants are unlimited made-to-order, paused, or quantity-limited.
  - Prevent unavailable variants from being added to cart or purchased.
- [ ] Add an admin order list with payment, fulfillment, and shipping status <!-- task:YUZ-M2-012 -->
- [ ] Add safe product archiving so historical orders keep their original product details <!-- task:YUZ-M2-013 -->

## M3: Print storefront experience

### Goal
Present a focused, responsive art-print catalog and product-buying experience.

### Implementation
- [x] Apply the yuzimiONLINE visual system across desktop and mobile layouts <!-- task:YUZ-M3-001 -->
- [x] Repair the mobile header, cart button, and navigation spacing <!-- task:YUZ-M3-002 -->
- [x] Limit the collection experience to art prints <!-- task:YUZ-M3-003 -->
- [x] Add collection search and Featured, Bestsellers, price, and alphabetical sorting <!-- task:YUZ-M3-004 -->
- [x] Change the collection item count to “Displaying X item(s)” <!-- task:YUZ-M3-005 -->
- [x] Add the Collection 001 — Cherry Blossoms banner and supporting copy <!-- task:YUZ-M3-006 -->
- [x] Display an anime or series label and a starting price on product cards <!-- task:YUZ-M3-007 -->
- [x] Build product pages with gallery images, description, eight size options, and variant pricing <!-- task:YUZ-M3-008 -->
- [x] Keep print sizes in a four-by-two grid on supported mobile widths <!-- task:YUZ-M3-009 -->
- [x] Use “Add to Cart” for the product purchase action <!-- task:YUZ-M3-010 -->
- [x] Replace apparel-oriented support copy with art-print shipping, returns, care, and FAQ content <!-- task:YUZ-M3-011 -->
- [ ] Replace remaining placeholder products, mock data, dead links, and temporary copy <!-- task:YUZ-M3-012 -->
  - Confirm no non-print mock products appear if the database is empty or unavailable.
- [ ] Add informative empty, loading, and error states for catalog and product requests <!-- task:YUZ-M3-013 -->
- [ ] Verify every navigation, footer, support, and legal link on desktop and mobile <!-- task:YUZ-M3-014 -->

## M4: Cart and Stripe test checkout

### Goal
Complete and verify the test-mode purchase flow before accepting real payments.

### Implementation
- [x] Add size-aware cart items and quantity controls <!-- task:YUZ-M4-001 -->
- [x] Calculate cart subtotal from the selected variant prices <!-- task:YUZ-M4-002 -->
- [x] Add destination selection and shipping estimates for supported countries <!-- task:YUZ-M4-003 -->
- [x] Keep United States shipping free in the current rate table <!-- task:YUZ-M4-004 -->
- [x] Create Stripe-hosted Checkout Sessions from server-validated database prices <!-- task:YUZ-M4-005 -->
- [x] Store pending checkout orders in Neon before redirecting to Stripe <!-- task:YUZ-M4-006 -->
- [x] Add success and cancellation routes plus payment-status verification <!-- task:YUZ-M4-007 -->
- [x] Add a signed Stripe webhook handler for test events <!-- task:YUZ-M4-008 -->
- [ ] Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Vercel Preview and Production <!-- task:YUZ-M4-009 -->
  - Use test-mode values until the complete checkout flow passes acceptance testing.
  - Never commit either value to the repository.
- [ ] Register the deployed `/api/stripe-webhook` endpoint in Stripe test mode <!-- task:YUZ-M4-010 -->
- [ ] Run an end-to-end Stripe test purchase for every supported shipping region <!-- task:YUZ-M4-011 -->
  - Confirm the browser reaches Stripe, payment succeeds, the order becomes paid, and the cart clears.
  - Confirm cancelled and declined payments do not become paid orders.
- [ ] Verify webhook retries and duplicate events do not duplicate orders or fulfillment <!-- task:YUZ-M4-012 -->
- [ ] Remove test-mode messaging only after production checkout is approved <!-- task:YUZ-M4-013 -->

## M5: Production payments and order integrity

### Goal
Accept real payments without trusting prices, totals, or payment state supplied by the browser.

### Implementation
- [ ] Decide the production merchant name, statement descriptor, support email, and refund policy in Stripe <!-- task:YUZ-M5-001 -->
- [ ] Activate and verify the Stripe account for live payments <!-- task:YUZ-M5-002 -->
- [ ] Add separate Stripe live-mode environment variables and protect preview deployments from live charges <!-- task:YUZ-M5-003 -->
- [ ] Reconcile every paid order against its Stripe session amount, currency, destination, and server-side line items <!-- task:YUZ-M5-004 -->
- [ ] Persist Stripe customer, payment, refund, and event identifiers needed for support and reconciliation <!-- task:YUZ-M5-005 -->
- [ ] Add an idempotent event ledger for processed Stripe webhook event IDs <!-- task:YUZ-M5-006 -->
- [ ] Add admin actions for refund, cancellation, and manual fulfillment review <!-- task:YUZ-M5-007 -->
- [ ] Define how failed, expired, disputed, refunded, and partially refunded orders change status <!-- task:YUZ-M5-008 -->
- [ ] Test live-mode readiness with Stripe’s production checklist before enabling the live key <!-- task:YUZ-M5-009 -->
- [ ] Make one controlled low-value live purchase and refund before public launch <!-- task:YUZ-M5-010 -->

## M6: Print fulfillment workflow

### Goal
Turn paid orders into traceable print production and delivery.

### Implementation
- [ ] Choose the print provider and document paper, finish, bleed, color profile, and supported dimensions <!-- task:YUZ-M6-001 -->
- [ ] Create a print-ready asset naming and storage convention for every product and size <!-- task:YUZ-M6-002 -->
- [ ] Validate source artwork resolution for all eight print dimensions before publishing <!-- task:YUZ-M6-003 -->
- [ ] Decide whether fulfillment is manual, provider-API driven, or a staged combination <!-- task:YUZ-M6-004 -->
- [ ] Prevent fulfillment from starting unless the order is confirmed paid <!-- task:YUZ-M6-005 -->
- [ ] Record production status, provider order ID, tracking number, and shipment date <!-- task:YUZ-M6-006 -->
- [ ] Add retry and manual-review handling for rejected or failed fulfillment submissions <!-- task:YUZ-M6-007 -->
- [ ] Complete a physical sample order for every paper/finish combination <!-- task:YUZ-M6-008 -->
- [ ] Approve packaging, print quality, color accuracy, damage resistance, and unboxing presentation <!-- task:YUZ-M6-009 -->

## M7: Shipping, customs, and taxes

### Goal
Show accurate landed costs and restrict checkout to destinations the business can serve.

### Implementation
- [x] Implement the current United States, Canada, United Kingdom, and selected European shipping table <!-- task:YUZ-M7-001 -->
- [x] Keep the cart destination list synchronized with server-side supported countries <!-- task:YUZ-M7-002 -->
- [ ] Confirm all base and additional-item rates against the selected print provider <!-- task:YUZ-M7-003 -->
- [ ] Publish the final Europe exception list and ensure excluded countries cannot check out <!-- task:YUZ-M7-004 -->
- [ ] Decide whether prices include tax and configure Stripe Tax or a documented manual tax approach <!-- task:YUZ-M7-005 -->
- [ ] Define duties, VAT, customs, and importer-of-record messaging for international customers <!-- task:YUZ-M7-006 -->
- [ ] Add address-validation and undeliverable-address handling <!-- task:YUZ-M7-007 -->
- [ ] Verify shipping calculations for mixed sizes, multiple quantities, and edge destinations <!-- task:YUZ-M7-008 -->
- [ ] Publish realistic processing and delivery estimates separately <!-- task:YUZ-M7-009 -->

## M8: Customer communication and support

### Goal
Give customers clear confirmations, status updates, and a reliable way to get help.

### Implementation
- [ ] Set up a transactional email provider and verified sending domain <!-- task:YUZ-M8-001 -->
- [ ] Send order confirmations only after verified payment <!-- task:YUZ-M8-002 -->
- [ ] Send shipping confirmations with carrier and tracking details <!-- task:YUZ-M8-003 -->
- [ ] Add internal alerts for new paid orders, fulfillment failures, and disputes <!-- task:YUZ-M8-004 -->
- [ ] Connect the support/contact form to a monitored inbox with spam protection <!-- task:YUZ-M8-005 -->
- [ ] Add a customer order lookup or secure order-status link <!-- task:YUZ-M8-006 -->
- [ ] Finalize FAQ answers for processing time, materials, sizing, shipping regions, returns, and damaged prints <!-- task:YUZ-M8-007 -->
- [ ] Create support procedures for address changes, damage claims, lost packages, cancellations, and refunds <!-- task:YUZ-M8-008 -->

## M9: Legal, privacy, and security

### Goal
Protect customer data and publish policies that match the actual business process.

### Implementation
- [ ] Replace placeholder legal pages with reviewed Terms of Service, Privacy Policy, Shipping Policy, and Return Policy <!-- task:YUZ-M9-001 -->
- [ ] Add business contact details and any legally required seller disclosures <!-- task:YUZ-M9-002 -->
- [ ] Document customer-data retention and deletion rules for Neon, Stripe, email, and logs <!-- task:YUZ-M9-003 -->
- [ ] Rotate any credential that has ever appeared in a screenshot, chat, log, or commit <!-- task:YUZ-M9-004 -->
- [ ] Add rate limiting to admin login, uploads, checkout creation, and public contact endpoints <!-- task:YUZ-M9-005 -->
- [ ] Add CSRF protection or strict origin validation to authenticated admin mutations <!-- task:YUZ-M9-006 -->
- [ ] Restrict upload MIME types, file signatures, dimensions, and size; randomize all object keys <!-- task:YUZ-M9-007 -->
- [ ] Add security headers and a Content Security Policy compatible with Stripe and R2 images <!-- task:YUZ-M9-008 -->
- [ ] Review logs and API errors to ensure passwords, cookies, database URLs, and keys are never exposed <!-- task:YUZ-M9-009 -->
- [ ] Back up Neon data and document tested product/order restore procedures <!-- task:YUZ-M9-010 -->

## M10: Quality, accessibility, and discoverability

### Goal
Make the shop reliable, fast, accessible, searchable, and measurable.

### Implementation
- [ ] Add unit tests for money math, shipping rules, checkout validation, and order state changes <!-- task:YUZ-M10-001 -->
- [ ] Add API integration tests for admin authentication, products, uploads, checkout, status, and webhooks <!-- task:YUZ-M10-002 -->
- [ ] Add browser tests for catalog search, variant choice, cart edits, checkout redirect, and mobile navigation <!-- task:YUZ-M10-003 -->
- [ ] Test current Chrome, Safari, Firefox, Edge, iOS Safari, and Android Chrome <!-- task:YUZ-M10-004 -->
- [ ] Complete keyboard, focus, screen-reader, color-contrast, and reduced-motion accessibility review <!-- task:YUZ-M10-005 -->
- [ ] Add responsive image sizes, compression, lazy loading, and stable aspect ratios <!-- task:YUZ-M10-006 -->
- [ ] Meet agreed Core Web Vitals targets on home, collection, and product pages <!-- task:YUZ-M10-007 -->
- [ ] Add unique titles, meta descriptions, canonical URLs, Open Graph images, sitemap, and robots directives <!-- task:YUZ-M10-008 -->
- [ ] Add Product and Organization structured data using real catalog values <!-- task:YUZ-M10-009 -->
- [ ] Configure privacy-conscious analytics for product views, add-to-cart, checkout start, and purchase <!-- task:YUZ-M10-010 -->
- [ ] Add application error monitoring and alerts for API, database, R2, Stripe, and checkout failures <!-- task:YUZ-M10-011 -->

## M11: Launch and ongoing operations

### Goal
Launch deliberately, verify the real buying journey, and keep the store healthy afterward.

### Implementation
- [ ] Connect the production custom domain and verify HTTPS, redirects, and canonical host behavior <!-- task:YUZ-M11-001 -->
- [ ] Create a launch inventory with final titles, series, descriptions, alt text, prices, and approved artwork <!-- task:YUZ-M11-002 -->
- [ ] Run a content proofread and visual QA at common desktop, tablet, and mobile sizes <!-- task:YUZ-M11-003 -->
- [ ] Complete the prelaunch runbook covering database, storage, Stripe, email, fulfillment, policies, and support <!-- task:YUZ-M11-004 -->
- [ ] Run a full production smoke test from landing page through payment, fulfillment, email, and tracking <!-- task:YUZ-M11-005 -->
- [ ] Publish the store only after the launch checklist and rollback plan are approved <!-- task:YUZ-M11-006 -->
- [ ] Review orders, failed checkouts, fulfillment exceptions, support inbox, and error alerts daily after launch <!-- task:YUZ-M11-007 -->
- [ ] Review conversion, cart abandonment, shipping cost, refund rate, and print defects after the first 30 days <!-- task:YUZ-M11-008 -->
- [ ] Maintain a monthly dependency, credential, backup, policy, and disaster-recovery review <!-- task:YUZ-M11-009 -->

## Completion rule

Do not check off a task merely because code exists. For tasks that involve third-party configuration, payments, fulfillment, security, or launch readiness, mark them complete only after the deployed behavior has been tested and the operational procedure has been documented.
