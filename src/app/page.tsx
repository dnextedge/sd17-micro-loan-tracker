export default function Home() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[var(--surface)] px-5 py-8 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute -top-32 right-[-8rem] h-96 w-96 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-12rem] left-[-8rem] h-96 w-96 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="grid size-11 place-items-center rounded-2xl bg-emerald-800 text-sm font-bold tracking-tight text-white shadow-sm"
              aria-hidden="true"
            >
              LT
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-950">
                LoanTrack NG
              </p>
              <p className="text-xs font-medium text-slate-500">
                Clear loans. Confident decisions.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            SD-17 Foundation
          </span>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="mb-5 text-sm font-bold tracking-[0.18em] text-emerald-700 uppercase">
              3MTT NextGen Cohort Capstone
            </p>
            <h1 className="max-w-3xl text-5xl leading-[1.02] font-bold tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Micro-loan tracking, made clear.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              LoanTrack NG will bring borrower registration, loan requests,
              approvals, repayment schedules, and balance tracking into one
              secure digital workflow.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
              {[
                "Borrower-first",
                "Audit-friendly",
                "Built for NGN",
                "Secure by design",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Project status
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  Foundation ready
                </p>
              </div>
              <div className="grid size-12 place-items-center rounded-full bg-emerald-100 text-xl text-emerald-800">
                <span aria-hidden="true">✓</span>
                <span className="sr-only">Complete</span>
              </div>
            </div>
            <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/6 rounded-full bg-emerald-700" />
            </div>
            <dl className="mt-8 grid gap-5 border-t border-slate-100 pt-6">
              {[
                ["Project", "SD-17 — Micro-Loan Tracker"],
                ["Stack", "Next.js · Supabase · PostgreSQL"],
                ["Currency", "Nigerian Naira (NGN)"],
                ["Current phase", "Core foundation"],
              ].map(([term, detail]) => (
                <div
                  key={term}
                  className="flex items-start justify-between gap-6"
                >
                  <dt className="text-sm text-slate-500">{term}</dt>
                  <dd className="text-right text-sm font-semibold text-slate-800">
                    {detail}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200/80 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Digital Micro-Loan Request &amp; Repayment Tracking</p>
          <p>This software is a tracking system, not a licensed lender.</p>
        </footer>
      </div>
    </main>
  );
}
