import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden bg-emerald-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-400 text-sm text-emerald-950">
            LT
          </span>
          LoanTrack NG
        </Link>
        <div className="max-w-lg">
          <p className="text-sm font-bold tracking-[0.16em] text-emerald-300 uppercase">
            Financial clarity for every step
          </p>
          <h1 className="mt-5 text-5xl leading-tight font-bold tracking-tight">
            Know where every loan stands.
          </h1>
          <p className="mt-5 text-lg leading-8 text-emerald-100/80">
            Request, review, disburse, and track repayments in one secure,
            audit-friendly workflow.
          </p>
        </div>
        <p className="text-sm text-emerald-200/70">
          3MTT NextGen Cohort · SD-17
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-3 font-bold text-slate-950 lg:hidden"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-800 text-sm text-white">
              LT
            </span>
            LoanTrack NG
          </Link>
          {children}
        </div>
      </section>
    </main>
  );
}
