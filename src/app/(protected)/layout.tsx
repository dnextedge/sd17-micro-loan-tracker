import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/(auth)/actions";
import { getCurrentRole, requireUser } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [, role] = await Promise.all([requireUser(), getCurrentRole()]);
  const dashboardHref = role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-18 max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:flex-nowrap sm:gap-5 sm:px-8">
          <Link
            href={dashboardHref}
            className="flex items-center gap-3 font-bold text-slate-950"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-800 text-xs text-white">
              LT
            </span>
            <span className="hidden sm:inline">LoanTrack NG</span>
          </Link>
          <nav
            aria-label="Account navigation"
            className="order-3 flex w-full items-center gap-1 overflow-x-auto pb-1 sm:order-none sm:w-auto sm:gap-4 sm:pb-0"
          >
            {role === "admin" ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/applications"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Applications
                </Link>
                <Link
                  href="/admin/loans"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Loans
                </Link>
                <Link
                  href="/admin/repayments"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Repayments
                </Link>
                <Link
                  href="/admin/borrowers"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Borrowers
                </Link>
                <Link
                  href="/admin/reports"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Reports
                </Link>
                <Link
                  href="/admin/settings"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Dashboard
                </Link>
                <Link
                  href="/applications"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Applications
                </Link>
                <Link
                  href="/loans"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Loans
                </Link>
                <Link
                  href="/repayments"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Repayments
                </Link>
                <Link
                  href="/profile"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Profile
                </Link>
              </>
            )}
            <form action={logout}>
              <button
                type="submit"
                className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
