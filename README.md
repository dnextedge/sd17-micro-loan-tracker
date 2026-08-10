# LoanTrack NG

Digital Micro-Loan Request & Repayment Tracking.

LoanTrack NG is a 3MTT capstone project that will replace paper forms, notebooks, and disconnected spreadsheets with a focused workflow for requesting, reviewing, disbursing, and tracking micro-loans. It is a tracking and management system, not a licensed lender.

> Development status: Phases 1 and 2 complete; Phase 3 authentication and
> borrower-profile implementation is in progress. Automated checks and the
> production build pass, but hosted Supabase credentials and end-to-end Auth
> QA are still pending.

## 3MTT Project Information

- **Project ID:** SD-17
- **Assigned Task:** Micro-Loan Tracker
- **Cohort:** 3MTT NextGen Cohort

## Problem Statement

Manual micro-loan records make it difficult for borrowers to understand application status and balances, while administrators must reconcile approvals, schedules, and repayments across paper or spreadsheet records. This creates avoidable delays, calculation mistakes, and incomplete audit trails.

## Proposed Solution

LoanTrack NG will provide two simple role-based experiences:

- Borrowers register, maintain a profile, request loans, and monitor applications and repayments.
- Administrators review applications, manage disbursement, generate schedules, record repayments, and monitor the portfolio.

## Key Features

The submission MVP is planned to include:

- Supabase authentication and password recovery
- Borrower profiles and loan applications
- Administrator review, approval, and rejection
- Loan disbursement and repayment schedule generation
- Immutable repayment transactions and allocation
- Outstanding balance and overdue detection
- Borrower and administrator dashboards
- Status history, audit logs, search, and filters
- PostgreSQL Row Level Security

## Technology Stack

- HTML5 and CSS3
- Tailwind CSS 4
- TypeScript, React 19, and Next.js 16 App Router
- Node.js through Next.js server functionality
- PostgreSQL and Supabase
- Supabase Auth
- Vitest and Testing Library
- Git, GitHub, Vercel

## System Architecture

The browser renders React UI while authenticated reads execute in Next.js Server Components. Internal mutations use validated Server Actions and restricted PostgreSQL functions. Supabase Auth supplies identity; PostgreSQL constraints and RLS remain the final authorization boundary. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Database

All monetary values are stored as `BIGINT` minor units (kobo). The
version-controlled schema separates applications, loans, schedules, and
immutable repayment transactions. See [docs/DATABASE.md](docs/DATABASE.md).

## Security

- Secrets are excluded from Git.
- The service-role key must never use a `NEXT_PUBLIC_` prefix.
- Borrower/admin record visibility is enforced in PostgreSQL RLS.
- Sensitive financial and lifecycle operations will be transactional database functions.
- Roles will not be accepted from client-controlled signup metadata.

See [docs/SECURITY.md](docs/SECURITY.md).

## Screenshots

Submission screenshots will be added after the end-to-end MVP is complete and production QA passes.

## Installation

Requirements:

- Node.js 20.9 or newer
- npm
- Docker Desktop for the local Supabase stack

```bash
git clone https://github.com/dnextedge/sd17-micro-loan-tracker.git
cd sd17-micro-loan-tracker
npm install
cp .env.example .env.local
```

## Environment Variables

| Variable                        | Exposure              | Purpose                            |
| ------------------------------- | --------------------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Browser-safe          | Supabase project URL               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe          | Supabase anonymous/publishable key |
| `NEXT_PUBLIC_APP_URL`           | Browser-safe          | Canonical application URL          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only, optional | Trusted administrative tasks only  |

Never commit `.env.local` or production credentials.

## Supabase Setup

```bash
npm run supabase:start
npm run db:reset
```

The first command requires Docker Desktop. `db:reset` replays the
version-controlled migration and synthetic demonstration seed. Run `npm run
db:test` afterward to execute the pgTAP constraint and RLS suites.

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run db:test
npm run build
```

See [docs/TESTING.md](docs/TESTING.md) for the planned business-logic, RLS, integration, and manual QA suites.

## Deployment

The Phase 1 foundation is deployed at [sd17-micro-loan-tracker.vercel.app](https://sd17-micro-loan-tracker.vercel.app). Vercel hosts the Next.js application, and Supabase is the planned managed database/authentication provider. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Demo Credentials

The local-only synthetic seed creates these accounts:

| Role     | Email                        | Password              |
| -------- | ---------------------------- | --------------------- |
| Borrower | `emem.borrower@example.test` | `LoanTrackDemo!2026`  |
| Admin    | `admin@example.test`         | `LoanTrackAdmin!2026` |

These `.test` accounts contain no real personal or financial information. The
seed is not applied by `supabase db push`; production demonstration credentials
must be created separately and rotated before public submission.

## SD-17 Compliance

The table reports the current repository state, not the intended final state.

| Requirement  | Implementation                        | Current status                     |
| ------------ | ------------------------------------- | ---------------------------------- |
| Loan Request | Next.js/Supabase workflow             | Planned                            |
| Loan Status  | Application and loan lifecycle        | Planned                            |
| Repayments   | Immutable transactions and allocation | Planned                            |
| Deployment   | Vercel                                | Foundation deployed                |
| HTML         | HTML5                                 | Foundation complete                |
| CSS          | CSS3/Tailwind CSS                     | Foundation complete                |
| JavaScript   | JavaScript/TypeScript                 | Foundation complete                |
| Framework    | React/Next.js                         | Foundation complete                |
| Backend      | Node.js via Next.js                   | Foundation complete                |
| Database     | PostgreSQL/Supabase                   | Schema/RLS verified in Supabase CI |
| Source Code  | GitHub                                | Published                          |
| README       | Included                              | Foundation complete                |
| Demo Video   | Link added before submission          | Pending MVP                        |

See [docs/SD17_COMPLIANCE.md](docs/SD17_COMPLIANCE.md) for the acceptance checklist.

## Known MVP Limitations

- LoanTrack NG is not a lender and does not make real credit decisions.
- No real disbursement or payment gateway is included.
- No BVN, NIN, bank-login, or payment-card data is collected.
- The MVP supports borrower and administrator roles only.
- Notifications are initially in-app only.

## Future Improvements

Email and messaging reminders, printable statements, PWA support, cooperative management, branches, and configurable products are post-submission work. See [docs/FUTURE_ROADMAP.md](docs/FUTURE_ROADMAP.md).

## Author

Built for the 3MTT NextGen Cohort under GitHub account [dnextedge](https://github.com/dnextedge).
