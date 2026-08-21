import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  LOAN_STATUS_LABELS,
  loanStatusBadgeClass,
  type LoanStatus,
} from "@/lib/loan-status";
import { formatKobo, parseNairaToKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    error?: string;
    maxAmount?: string;
    minAmount?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function AdminLoansPage({ searchParams }: Props) {
  await requireAdmin();
  const {
    dateFrom = "",
    dateTo = "",
    error,
    maxAmount = "",
    minAmount = "",
    q = "",
    status = "",
  } = await searchParams;
  const supabase = await createClient();
  const minimum = parseNairaToKobo(minAmount);
  const maximum = parseNairaToKobo(maxAmount);
  let query = supabase
    .from("loans")
    .select(
      "id, loan_number, principal_amount, outstanding_balance, status, created_at, profiles!loans_borrower_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false });
  if (status && status in LOAN_STATUS_LABELS)
    query = query.eq("status", status as LoanStatus);
  if (minimum !== null) query = query.gte("principal_amount", minimum);
  if (maximum !== null) query = query.lte("principal_amount", maximum);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom))
    query = query.gte("created_at", `${dateFrom}T00:00:00Z`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo))
    query = query.lte("created_at", `${dateTo}T23:59:59.999Z`);
  const { data } = await query;
  const search = q.trim().toLocaleLowerCase();
  const loans = search
    ? data?.filter((loan) =>
        [loan.loan_number, loan.profiles?.full_name].some((value) =>
          value?.toLocaleLowerCase().includes(search),
        ),
      )
    : data;

  return (
    <div>
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Loan officer workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        Loans
      </h1>
      <p className="mt-3 text-slate-600">
        Track approved loans, disbursement, schedules, and balances.
      </p>
      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          className="min-h-11 rounded-xl border border-slate-300 px-4"
          placeholder="Borrower or loan number"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-h-11 rounded-xl border border-slate-300 px-4"
        >
          <option value="">All loan statuses</option>
          {Object.entries(LOAN_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="minAmount"
          min="0"
          step="0.01"
          defaultValue={minAmount}
          placeholder="Minimum principal (₦)"
          className="min-h-11 rounded-xl border border-slate-300 px-4"
        />
        <input
          type="number"
          name="maxAmount"
          min="0"
          step="0.01"
          defaultValue={maxAmount}
          placeholder="Maximum principal (₦)"
          className="min-h-11 rounded-xl border border-slate-300 px-4"
        />
        <label className="grid gap-1 text-xs font-bold text-slate-500">
          From date
          <input
            type="date"
            name="dateFrom"
            defaultValue={dateFrom}
            className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-normal text-slate-900"
          />
        </label>
        <label className="grid gap-1 text-xs font-bold text-slate-500">
          To date
          <input
            type="date"
            name="dateTo"
            defaultValue={dateTo}
            className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-normal text-slate-900"
          />
        </label>
        <button className="min-h-11 rounded-xl bg-slate-900 px-5 font-bold text-white">
          Filter loans
        </button>
        <Link
          href="/admin/loans"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 font-bold text-slate-700"
        >
          Clear filters
        </Link>
      </form>
      {!loans?.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No loans match this filter. Create a loan from an approved
          application.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {loans.map((loan) => (
            <Link
              key={loan.id}
              href={`/admin/loans/${loan.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">{loan.loan_number}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {loan.profiles?.full_name ?? "Borrower"}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${loanStatusBadgeClass(loan.status)}`}
                >
                  {LOAN_STATUS_LABELS[loan.status]}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <p>
                  <span className="text-sm text-slate-500">Principal</span>
                  <br />
                  <strong>{formatKobo(loan.principal_amount)}</strong>
                </p>
                <p>
                  <span className="text-sm text-slate-500">Outstanding</span>
                  <br />
                  <strong>{formatKobo(loan.outstanding_balance)}</strong>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
