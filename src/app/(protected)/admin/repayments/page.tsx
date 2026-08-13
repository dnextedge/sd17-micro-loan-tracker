import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { formatKobo, parseNairaToKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    maxAmount?: string;
    method?: string;
    minAmount?: string;
    q?: string;
    repaymentStatus?: string;
  }>;
};

const paymentMethods = ["cash", "bank_transfer", "other"] as const;
const repaymentStatuses = [
  "pending",
  "partially_paid",
  "paid",
  "overdue",
] as const;

export default async function AdminRepaymentsPage({ searchParams }: Props) {
  await requireAdmin();
  const {
    dateFrom = "",
    dateTo = "",
    maxAmount = "",
    method = "",
    minAmount = "",
    q = "",
    repaymentStatus = "",
  } = await searchParams;
  const supabase = await createClient();
  const minimum = parseNairaToKobo(minAmount);
  const maximum = parseNairaToKobo(maxAmount);
  let query = supabase
    .from("repayments")
    .select(
      "id, loan_id, payment_reference, amount, payment_method, payment_date, loans!repayment_loan_borrower_fk(loan_number, profiles!loans_borrower_id_fkey(full_name))",
    )
    .order("created_at", { ascending: false });
  if (paymentMethods.includes(method as (typeof paymentMethods)[number]))
    query = query.eq(
      "payment_method",
      method as (typeof paymentMethods)[number],
    );
  if (minimum !== null) query = query.gte("amount", minimum);
  if (maximum !== null) query = query.lte("amount", maximum);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom))
    query = query.gte("payment_date", dateFrom);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo))
    query = query.lte("payment_date", dateTo);
  let scheduleQuery = supabase
    .from("repayment_schedule_effective")
    .select(
      "id, loan_id, installment_number, due_date, outstanding_amount, effective_status, loans!repayment_schedules_loan_id_fkey(loan_number, profiles!loans_borrower_id_fkey(full_name))",
    )
    .order("due_date");
  if (
    repaymentStatuses.includes(
      repaymentStatus as (typeof repaymentStatuses)[number],
    )
  )
    scheduleQuery = scheduleQuery.eq(
      "effective_status",
      repaymentStatus as (typeof repaymentStatuses)[number],
    );
  const [{ data }, { data: schedules }] = await Promise.all([
    query,
    scheduleQuery,
  ]);
  const search = q.trim().toLocaleLowerCase();
  const repayments = search
    ? data?.filter((payment) =>
        [
          payment.payment_reference,
          payment.loans?.loan_number,
          payment.loans?.profiles?.full_name,
        ].some((value) => value?.toLocaleLowerCase().includes(search)),
      )
    : data;

  return (
    <div>
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Loan officer workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold">Repayments</h1>
      <p className="mt-3 text-slate-600">
        Immutable payment transactions recorded across the portfolio.
      </p>
      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Borrower, loan, or reference"
          className="min-h-11 rounded-xl border border-slate-300 px-4"
        />
        <select
          name="method"
          defaultValue={method}
          className="min-h-11 rounded-xl border border-slate-300 px-4"
        >
          <option value="">All payment methods</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="cash">Cash</option>
          <option value="other">Other</option>
        </select>
        <select
          name="repaymentStatus"
          defaultValue={repaymentStatus}
          className="min-h-11 rounded-xl border border-slate-300 px-4"
        >
          <option value="">All installment statuses</option>
          <option value="pending">Pending</option>
          <option value="partially_paid">Partially paid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <input
          type="number"
          name="minAmount"
          min="0"
          step="0.01"
          defaultValue={minAmount}
          placeholder="Minimum amount (₦)"
          className="min-h-11 rounded-xl border border-slate-300 px-4"
        />
        <input
          type="number"
          name="maxAmount"
          min="0"
          step="0.01"
          defaultValue={maxAmount}
          placeholder="Maximum amount (₦)"
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
          Filter repayments
        </button>
        <Link
          href="/admin/repayments"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 font-bold text-slate-700"
        >
          Clear filters
        </Link>
      </form>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold">Installment status monitor</h2>
        {!schedules?.length ? (
          <p className="mt-3 text-sm text-slate-600">
            No installments match the selected status.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {schedules.slice(0, 12).map((schedule) => (
              <Link
                key={schedule.id}
                href={`/admin/loans/${schedule.loan_id}`}
                className="grid gap-2 rounded-xl bg-slate-50 p-4 sm:grid-cols-5 sm:items-center"
              >
                <strong>{schedule.loans?.loan_number}</strong>
                <span>{schedule.loans?.profiles?.full_name}</span>
                <span>Installment {schedule.installment_number}</span>
                <span>{formatDate(schedule.due_date)}</span>
                <span
                  className={
                    schedule.effective_status === "overdue"
                      ? "font-bold text-red-700"
                      : "font-semibold text-slate-700"
                  }
                >
                  {schedule.effective_status?.replaceAll("_", " ")} ·{" "}
                  {formatKobo(schedule.outstanding_amount ?? 0)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
      <h2 className="mt-8 text-xl font-bold">Transaction history</h2>
      {!repayments?.length ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No repayments match these filters.
        </p>
      ) : (
        <div className="mt-6 grid gap-3">
          {repayments.map((payment) => (
            <Link
              key={payment.id}
              href={`/admin/loans/${payment.loan_id}`}
              className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300 sm:grid-cols-5 sm:items-center"
            >
              <div>
                <strong>{payment.payment_reference}</strong>
                <p className="text-sm text-slate-500">
                  {payment.loans?.profiles?.full_name}
                </p>
              </div>
              <span>{payment.loans?.loan_number}</span>
              <span>{formatDate(payment.payment_date)}</span>
              <span className="capitalize">
                {payment.payment_method.replaceAll("_", " ")}
              </span>
              <strong>{formatKobo(payment.amount)}</strong>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
