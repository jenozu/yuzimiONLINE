# YUZIMI recovery: operator runbook

**Incident:** September 27, 2026: /collections showed `Cannot read properties of null (reading 'products')` and /admin returned HTTP 404. This followed the autonomous September 27 feature batch, then a Vercel Hobby serverless-function consolidation. Root cause is not independently confirmed because live Vercel access through the current connector returned HTTP 403.

## Immutable reference and scope
- Recovered application-code candidate: `d27de8b7bd0d6983505c07e2b5701a0650cda837` (September 24, directly before adding the master roadmap/autonomous batch).
- Snapshot of the affected newer main branch: `backup/pre-recovery-2026-09-27` at `195c9c9b783147f561d03ae01f799fedbf868004`. Do not delete.
- Never change or roll back the existing Neon data, R2 objects or Stripe transaction data as part of the **code** rollback. Do not re-run the old schema SQL against production.
- Keep Stripe in test mode. The candidate preserves the pre-batch Stripe test checkout code, which has not had a verified end-to-end production smoke test.

## Before merging or redeploying
1. Confirm the recovery PR's TypeScript + production-build GitHub workflow passes. Diff the PR to verify that runtime code matches the September 24 snapshot, with only recovery docs/checklist/CI additions.
2. If needed, use Vercel dashboard → yuzimi-online → Deployments to inspect September 23–24 deployments for one that was recorded **Ready** and includes the Bayonetta catalog/admin. This commit is a **candidate**, not a verified historical deployment. Prefer the pre-batch deployment actually observed to work.
3. Do not promote older deployments with stale production secrets or incompatible settings without checking the target. After any manual Vercel rollback, align GitHub `main` to the selected version; otherwise a future push will redeploy the broken version.
4. Confirm `DATABASE_URL` remains pointed at the original Neon production branch and R2 environment names match the pre-batch code. Never paste secrets into issues/screenshots.

## Production acceptance checklist (record the evidence)
- Vercel Production deployment is `Ready`. Record deployment ID, source commit, and time: __________.
- Open `/api/products` in browser: returns HTTP 200 and JSON `{ "products": [...] }`; find the original *published* Bayonetta entry. If empty, check **existing** Neon database and published status; do not recreate a duplicate.
- Open `/api/admin/session`: HTTP 200 JSON `{ "authenticated": false }` when logged out, not 404 or HTML.
- Open `/admin`; owner enters password locally, login works and Bayonetta remains in admin with saved variants.
- Open storefront `/collections`, Bayonetta detail page, and inspect all R2 image URLs, size-specific pricing, add-to-cart and refresh.
- Repeat catalog/cart test on a mobile viewport. Capture non-sensitive screenshots.
- In Stripe **test** mode, complete a test checkout, observe the correct order status and a 200 webhook delivery. No real card or fulfillment during recovery.
- Document any failures and Vercel function logs (redact secrets), and leave matching M0 tasks unchecked until resolved.

## When a check fails
- **API returns HTML or HTTP 404:** inspect deployment commit, explicit `api/products.ts` and `api/admin/login.ts` routes, Vercel build/framework detection and rewrites. Do not edit product records.
- **API returns 500:** inspect Vercel function logs, missing environment names and original Neon branch; redact logs before sharing.
- **API returns an empty JSON array:** verify the original database is connected and the listing is published.
- **Product loads but image fails:** inspect R2 bucket and object keys using existing admin records.
- **Build exceeds Vercel Hobby limits:** select a historically successful deployment or make the smallest targeted route fix on a branch; do not replay the large September 27 batch.

## Change-control rule
Until M0 is accepted, no autonomous roadmap-wide implementation batches, no major architecture rewrites, no production DB migrations, and no live payments. Use one small PR per task, with baseline build validation and deployed acceptance, then mark the exact matching roadmap task complete. The Voyages tool is for visualization of `master_plan.md`, not an authority to mark code or business decisions complete.
