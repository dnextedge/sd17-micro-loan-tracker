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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-bold text-slate-950"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-800 text-xs text-white">
              LT
            </span>
            <span className="hidden sm:inline">LoanTrack NG</span>
          </Link>
          <nav
            aria-label="Account navigation"
            className="flex items-center gap-2 sm:gap-4"
          >
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
              href="/profile"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Profile
            </Link>
            {role === "admin" ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                  Admin
                </Link>
                <Link
                  href="/admin/applications"
                  className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 md:inline"
                >
                  Review
                </Link>
              </>
            ) : null}
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
