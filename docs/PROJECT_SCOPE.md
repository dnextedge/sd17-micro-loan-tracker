# Project Scope

## Objective

LoanTrack NG digitizes a small, manually managed micro-loan workflow for the 3MTT NextGen Cohort SD-17 capstone. The MVP must demonstrate borrower registration through completed repayment tracking without becoming a banking platform.

## MVP users

- Borrower
- Loan officer/administrator

## In scope

- Authentication and password recovery
- Borrower profile
- Loan application submission and history
- Administrative review, approval, and rejection
- Loan creation and disbursement tracking
- Monthly repayment schedule generation
- Immutable repayment recording and allocation
- Outstanding balance, overdue, full-repayment, and completion states
- Borrower/admin dashboards, search, and filters
- Status history, audit records, RLS, seed data, tests, documentation, and Vercel deployment

## Out of scope

BVN/NIN, credit scoring, credit bureau access, bank APIs, real disbursement, payment gateways, card information, native mobile apps, biometrics, multi-institution support, and complex accounting.

## Delivery rule

The MVP is frozen and tagged `v1.0.0-3mtt-submission` only after automated checks, production build, Supabase security, Vercel deployment, private-browser QA, documentation, and the demo flow pass.
