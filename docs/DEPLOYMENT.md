# Deployment

## Targets

- Application: Vercel
- Database and authentication: Supabase
- Source: GitHub `dnextedge/sd17-micro-loan-tracker`

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

No deployment has been completed yet.
