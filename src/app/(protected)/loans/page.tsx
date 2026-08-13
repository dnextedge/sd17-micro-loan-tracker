import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { LOAN_STATUS_LABELS, loanStatusBadgeClass } from "@/lib/loan-status";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export default async function LoansPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: loans } = await supabase
    .from("loans")
    .select(
      "id, loan_number, principal_amount, amount_repaid, outstanding_balance, status, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Borrower workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        My loans
      </h1>
      <p className="mt-3 text-slate-600">
        View approved loan terms, repayment schedules, and current balances.
      </p>
      {!loans?.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No loan has been created from an approved application yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {loans.map((loan) => (
            <Link
              href={`/loans/${loan.id}`}
              key={loan.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <strong>{loan.loan_number}</strong>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${loanStatusBadgeClass(loan.status)}`}
                >
                  {LOAN_STATUS_LABELS[loan.status]}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold">
                {formatKobo(loan.principal_amount)}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
                <span>Repaid: {formatKobo(loan.amount_repaid)}</span>
                <span>Outstanding: {formatKobo(loan.outstanding_balance)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
