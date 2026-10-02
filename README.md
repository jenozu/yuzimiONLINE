# yuzimiONLINE — Recovery Baseline

This repository currently restores the storefront/API code from September 24, 2026 (`d27de8b7bd0d6983505c07e2b5701a0650cda837`), before the September 27 autonomous feature batch. The newer work remains preserved in `backup/pre-recovery-2026-09-27`. See `master_plan.md` **M0** and `docs/RECOVERY.md` before starting any new development.

**Recovery is not complete until the owner verifies the deployed catalog, Bayonetta listing, admin login and test checkout.** Do not infer live health from a passing build.

## Local development
- Node.js 22; run `npm ci`, `npm run lint`, `npm run build`.
- Copy `.env.example` to an ignored local environment file and supply your **own** credentials. Never commit credentials.
- `npm run dev` starts the Vite frontend. API requests require a Vercel-compatible local server or a deployed environment.
- Production Vercel project is `yuzimi-online` and should build from `main`.

## Data preservation and test payments
- The application uses an **existing** Neon database and Cloudflare R2 bucket. The code rollback must not delete or reset either; never apply the old `db/schema.sql` to production as a recovery tactic.
- Make sure `DATABASE_URL` references the same production Neon branch that held Bayonetta. `/api/products` returns `{ "products": [...] }`, with only published products.
- Required Vercel environment variables: `DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`. Stripe tests also require `STRIPE_SECRET_KEY` beginning with `sk_test_` and `STRIPE_WEBHOOK_SECRET` beginning with `whsec_`.
- Transactional email testing uses Resend. See `docs/EMAIL_SETUP.md` for `RESEND_API_KEY`, the temporary `onboarding@resend.dev` sender, safe test-recipient routing, and the later custom-domain switch.
- Do not use live payment keys or fulfill orders during recovery.

## Deployment and verification
- The CI workflow checks install, TypeScript and production build on pull requests. A green check does **not** prove the deployed API works.
- Follow `docs/RECOVERY.md` for the exact production smoke test, acceptance record and manual Vercel dashboard fallback.
- Resume feature work only after M0 is completed; make one narrowly scoped PR at a time and update `master_plan.md` after acceptance.
