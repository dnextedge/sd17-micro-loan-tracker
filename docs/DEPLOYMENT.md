# Deployment

## Targets

- Application: Vercel
- Database and authentication: Supabase
- Source: GitHub `dnextedge/sd17-micro-loan-tracker`

## Current production deployment

- Public URL: `https://sd17-micro-loan-tracker.vercel.app`
- Deployment ID: `dpl_DYGLVnxhy3FQcx3p9pJu8D2ZDLUv`
- Status verified: `Ready`
- Initial deployment date: 10 August 2026
- Scope: Phase 1 foundation only; authentication and business workflows are not yet deployed

The public alias returned HTTP 200 with HTTPS and HSTS enabled. Automatic Git deployments remain disconnected until the Vercel account adds its GitHub login connection; direct CLI deployment is working.

## Vercel configuration

- Framework preset: Next.js
- Install command: `npm install` or Vercel default
- Build command: `npm run build` (`next build --webpack`)
- Output: Next.js default
- Node.js: 22

Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL` for Preview and Production. Add a service-role key only if a reviewed server-only task requires it.

## Supabase configuration

Add local and production callback URLs to the Auth redirect allow-list. Link the CLI project, preview migrations, and deploy only reviewed migrations. Demo seed data must never be pushed into a real production dataset accidentally.

## Release verification

1. Run all local quality gates and production build.
2. Push the approved branch and deploy through Vercel.
3. Confirm no localhost URL remains in production configuration.
4. Test registration, sign-in, password reset, borrower/admin authorization, and the full loan workflow in an incognito browser.
5. Record the production URL and evidence.
6. Tag the verified commit `v1.0.0-3mtt-submission`.

The foundation deployment is complete. Full MVP production verification, Supabase environment variables, authentication redirects, and incognito workflow QA remain future release gates.
