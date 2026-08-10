# LoanTrack NG Engineering Guide

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product boundary

Build the SD-17 submission MVP before post-MVP features. This application tracks micro-loans; never describe it as a licensed lender or add real disbursement/payment processing without explicit approval.

## Required stack

- Next.js App Router, React, TypeScript strict mode, Tailwind CSS
- Node.js through Next.js server functionality
- PostgreSQL, Supabase, Supabase Auth
- npm and Vercel

Do not introduce Prisma, Firebase, MongoDB, Django, Laravel, or another major platform without documented approval.

## Engineering rules

- Keep secrets out of Git and service-role credentials out of browser code.
- Store money as integer minor units; do not calculate money with JavaScript floating point.
- Enforce authorization in PostgreSQL RLS and server/database code, not only UI guards.
- Keep repayment transactions append-only and update financial state atomically.
- Validate all mutations server-side and allow-list status transitions.
- Prefer Server Components for reads and Server Actions for internal mutations.
- Add tests with every business rule and run `npm run check` plus `npm run build`.
- Do not claim features, deployments, or tests that have not been verified.

## Documentation

Update the relevant file in `docs/` when architecture, database, security, testing, deployment, compliance, or scope decisions change.
