# SD-17 Compliance

This checklist is updated as functionality is verified. “Planned” does not mean implemented.

| Requirement  | Planned implementation           | Current state                      |
| ------------ | -------------------------------- | ---------------------------------- |
| Loan Request | Borrower application workflow    | Implemented; production QA passed  |
| Loan Status  | Lifecycle and history            | Implemented and deployed           |
| Repayments   | Immutable transaction allocation | Implemented and deployed           |
| Deployment   | Vercel                           | Phase 6 deployed; full QA pending  |
| HTML         | Next.js semantic HTML5           | Foundation complete                |
| CSS          | CSS3 and Tailwind CSS            | Foundation complete                |
| JavaScript   | TypeScript/JavaScript            | Foundation complete                |
| Framework    | React and Next.js                | Foundation complete                |
| Backend      | Next.js Node.js runtime          | Foundation complete                |
| Database     | Supabase PostgreSQL              | Schema/RLS verified in Supabase CI |
| Source Code  | GitHub                           | `main` and `develop` published     |
| README       | Repository README                | Included                           |
| Demo Video   | 2–3 minute deployed workflow     | Script drafted; recording pending  |

## Detailed MVP acceptance evidence

| #   | Acceptance criterion                     | Current evidence                                      |
| --- | ---------------------------------------- | ----------------------------------------------------- |
| 1   | Borrower can register                    | Implemented; local and earlier production QA passed   |
| 2   | Borrower can log in                      | Implemented; local and earlier production QA passed   |
| 3   | Borrower can create/update profile       | Implemented; production user QA passed                |
| 4   | Borrower can submit application          | Implemented; production user QA passed                |
| 5   | Borrower can see application status      | Implemented; production user QA passed                |
| 6   | Admin can view applications              | Implemented; production user QA passed                |
| 7   | Admin can mark Under Review              | Implemented; production user QA passed                |
| 8   | Admin can approve                        | Implemented; production user QA passed                |
| 9   | Admin can reject                         | Implemented; database and local browser QA passed     |
| 10  | Approved application becomes a loan      | Implemented; local browser and database QA passed     |
| 11  | Loan can be marked Disbursed             | Implemented; local browser and database QA passed     |
| 12  | Repayment schedule is generated          | Implemented; six-installment QA passed                |
| 13  | Admin can record repayment               | Implemented; local browser and database QA passed     |
| 14  | Repayment updates amount repaid          | Implemented; exact-balance QA passed                  |
| 15  | Outstanding balance updates              | Implemented; exact-balance QA passed                  |
| 16  | Repayment history remains visible        | Implemented; immutable transaction QA passed          |
| 17  | Overdue installment is identified        | Implemented; database and dashboard QA passed         |
| 18  | Fully repaid loan is detected            | Implemented; local browser and database QA passed     |
| 19  | Borrower sees repayment schedule         | Implemented; production borrower QA passed            |
| 20  | Admin dashboard has useful summaries     | Implemented; production administrator QA passed       |
| 21  | Borrower cannot access another borrower  | RLS denial covered by pgTAP                           |
| 22  | Borrower cannot access admin routes      | Server denial covered by browser and pgTAP            |
| 23  | Responsive on mobile                     | 390 × 844 authenticated production QA passed          |
| 24  | Production build passes                  | Next.js 16.3.0 build passed 13 August 2026            |
| 25  | Application deployed to Vercel           | `dpl_J8Q5zSfVWNziE56oh97dveBjLX2c` is `READY`         |
| 26  | Deployed app works in private browsing   | Authenticated production dashboard user-confirmed     |
| 27  | README explains setup and compliance     | Included and release-audited                          |
| 28  | Demonstration data is available          | Local synthetic seed included                         |
| 29  | Demo credentials documented safely       | Local pair included; production accounts kept private |
| 30  | 2–3 minute demonstration flow documented | `docs/DEMO_SCRIPT.md` complete; recording pending     |

The submission tag remains blocked by publication of the final video link. No
incomplete item is represented as passing.
