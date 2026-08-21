# Deployment

## Targets

- Application: Vercel
- Database and authentication: Supabase
- Source: GitHub `dnextedge/sd17-micro-loan-tracker`

## Current production deployment

- Public URL: `https://sd17-micro-loan-tracker.vercel.app`
- Deployment ID: `dpl_J8Q5zSfVWNziE56oh97dveBjLX2c`
- Status verified: `Ready`
- Latest deployment date: 13 August 2026
- Source commit: `617ea51`
- Scope: Complete Phase 6 MVP plus Phase 7 submission-status polish

The public login route returned HTTP 200 with HTTPS and HSTS enabled. Anonymous
borrower and administrator protected-route requests returned the expected
sign-in redirect, and Vercel reported no runtime errors after deployment.

## Vercel configuration

- Framework preset: Next.js
- Install command: `npm install` or Vercel default
- Build command: `npm run build` (`next build --webpack`)
- Output: Next.js default
- Node.js: 22

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`NEXT_PUBLIC_APP_URL` are configured in Vercel for Production and Preview.
Development uses the same Supabase project with `NEXT_PUBLIC_APP_URL` set to
`http://localhost:3000`. Add a service-role key only if a reviewed server-only
task requires it.

Server-side authentication actions prefer the deployment-specific `VERCEL_URL`
in Preview, preventing confirmation and reset callbacks from crossing into the
Production deployment. Production continues to use `NEXT_PUBLIC_APP_URL`.

## Supabase configuration

- Project: `LoanTrack NG` (`qrtenbcdiqdgehzonejb`), West EU (Ireland)
- Production Site URL: `https://sd17-micro-loan-tracker.vercel.app`
- Production and local `/auth/callback` paths are allow-listed, including their
  validated internal redirect query parameters.
- Production and local `/update-password` paths are allow-listed for the
  browser-only password recovery flow.
- Vercel previews use the team-scoped
  `https://*-dnextedge-8904s-projects.vercel.app/**` pattern.
- The CLI project is linked and all migrations through
  `20260813143000_loan_completion.sql` are applied.
- Demo seed data must never be pushed into a real production dataset accidentally.

## Release verification

1. Run all local quality gates and production build.
2. Push the approved branch and deploy through Vercel.
3. Confirm no localhost URL remains in production configuration.
4. Test registration, sign-in, password reset, borrower/admin authorization, and the full loan workflow in an incognito browser.
5. Record the production URL and evidence.
6. Tag the verified commit `v1.0.0-3mtt-submission`.

The complete application and hosted schema are deployed. Automated release
gates and public, authenticated, private-browser, and mobile QA pass. The demo
video is published and assessor-accessible. Submission release target:
`v1.0.0-3mtt-submission`.
