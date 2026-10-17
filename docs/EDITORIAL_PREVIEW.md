# YUZIMI Editorial Redesign — Isolated Preview

Branch: feat/yuzimi-editorial-redesign
Original main: 449c70f47bce208b243b93ea3693ce5edfbffa22
Production Vercel project: yuzimi-online — do not modify.

## Branding
Inter remains the sole font. Colors remain #FFB7C5, #89CFF0 and #141414 plus existing supportive tones.

## Preview requirements
Create an independent Vercel project, with no database, object-storage, Stripe, admin or Resend secrets.
Set YUZIMI_EDITORIAL_PREVIEW=true and VITE_EDITORIAL_PREVIEW=true for every environment of the isolated project.
Do not attach yuzimi.online to that project.
Public GET product and image endpoints proxy only the existing public YUZIMI catalog.
Checkout is an in-browser demonstration with no real orders, payment methods or submitted customer details.
All backend admin, checkout, status, contact, and webhook routes reject requests in preview mode.
No production database writes, emails, webhook events or R2 modifications are permitted.

## Print-size guide
Eight real print sizes are mapped relative to a 72 × 48 inch illustrated wall area.
The proportions are mathematically accurate to that reference area, but screen scale is illustrative.
No framing option is represented.

## Verification
Run npm ci, npm run lint, npm run build, npm run test:editorial, and existing tests.
Verify desktop/tablet/mobile navigation, published product catalog, size pricing, cart persistence and checkout isolation.
If the public production catalog is inaccessible, show an error instead of creating mock products or prices.

## Unchanged work and known limitations
Main, production domain, database schemas, pricing, payment contracts, and email integrations are not changed.
Legacy master_plan recovery tasks remain unverified; legal policy copy still needs an owner review.