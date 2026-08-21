# 2–3 Minute Demo Script

Production: `https://sd17-micro-loan-tracker.vercel.app`

Source: `https://github.com/dnextedge/sd17-micro-loan-tracker`

## Target sequence

1. **0:00–0:12:** Introduce the paper/notebook/spreadsheet tracking problem.
2. **0:12–0:22:** Open LoanTrack NG and identify SD-17.
3. **0:22–0:42:** Sign in as Emem James and submit a ₦120,000 inventory request for six months.
4. **0:42–1:05:** Sign in as administrator, review it, and approve it.
5. **1:05–1:25:** Mark the loan disbursed and show the generated six-installment schedule.
6. **1:25–1:43:** Record a ₦20,000 repayment and show the immutable reference/allocation.
7. **1:43–2:03:** Show amount repaid increasing and outstanding balance reducing.
8. **2:03–2:20:** Show admin dashboard summaries and overdue/upcoming repayments.
9. **2:20–2:35:** Return to the borrower dashboard and show status, next payment, and progress.
10. **2:35–2:50:** Mention Next.js, Supabase PostgreSQL/Auth, Vercel, and the GitHub repository.

## Presenter narration cues

- Open with: “Small loan teams often track requests and repayments in paper
  notebooks or disconnected spreadsheets, making balances and status difficult
  to verify.”
- Describe LoanTrack NG as a tracking and management system, not a licensed
  lender or payment processor.
- State that money is stored in integer kobo and that PostgreSQL RLS prevents a
  borrower from seeing another borrower's records.
- When recording the repayment, pause on the immutable payment reference and
  the reduced outstanding balance.
- Close with the visible production URL, SD-17 identifier, and GitHub source.

## Recording checklist

- Use demonstration-only borrower and administrator accounts.
- Start with a clean browser window and readable zoom level.
- Keep the deployed Vercel hostname visible at least once.
- Avoid showing passwords, inbox content, Supabase keys, or browser extensions.
- Keep the final edit between two and three minutes.
- Add the published video URL to README and the compliance table before tagging.
