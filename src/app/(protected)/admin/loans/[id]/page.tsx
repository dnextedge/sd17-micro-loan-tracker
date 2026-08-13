import Link from "next/link";
import { notFound } from "next/navigation";
import { disburseLoan, recordRepayment } from "@/app/(protected)/loans/actions";
import { requireAdmin } from "@/lib/auth";
import { dateInputAfterDays, formatDate } from "@/lib/date";
import { LOAN_STATUS_LABELS, loanStatusBadgeClass } from "@/lib/loan-status";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function AdminLoanDetails({
  params,
  searchParams,
}: Props) {
  await requireAdmin();
  const [{ id }, { error, message }] = await Promise.all([
    params,
    searchParams,
  ]);
  const supabase = await createClient();
  const [
    { data: loan },
    { data: schedule },
    { data: history },
    { data: repayments },
  ] = await Promise.all([
    supabase
      .from("loans")
      .select(
        "*, profiles!loans_borrower_id_fkey(full_name, phone, email), loan_applications!loans_loan_application_id_fkey(application_number, preferred_start_date, purpose)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("repayment_schedule_effective")
      .select("*")
      .eq("loan_id", id)
      .order("installment_number"),
    supabase
      .from("loan_status_history")
      .select("id, previous_status, new_status, notes, created_at")
      .eq("entity_type", "loan")
      .eq("entity_id", id)
      .order("created_at"),
    supabase
      .from("repayments")
      .select(
        "id, payment_reference, amount, payment_method, payment_date, notes, created_at",
      )
      .eq("loan_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (!loan) notFound();

  const preferredDate = loan.loan_applications?.preferred_start_date;
  const minimumDate = new Date().toISOString().slice(0, 10);
  const defaultFirstDate =
    preferredDate && preferredDate >= minimumDate
      ? preferredDate
      : dateInputAfterDays(30);

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/loans" className="text-sm font-bold text-emerald-800">
        ← Loans
      </Link>
      {message ? (
        <p
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500">
              {loan.loan_number}
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {formatKobo(loan.total_repayable)}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Total repayable</p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-sm font-bold ${loanStatusBadgeClass(loan.status)}`}
          >
            {LOAN_STATUS_LABELS[loan.status]}
          </span>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Principal" value={formatKobo(loan.principal_amount)} />
          <Metric
            label="Interest"
            value={`${loan.interest_rate}% · ${formatKobo(loan.interest_amount)}`}
          />
          <Metric
            label="Monthly installment"
            value={formatKobo(loan.installment_amount)}
          />
          <Metric
            label="Outstanding"
            value={formatKobo(loan.outstanding_balance)}
          />
        </div>
        <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-slate-500">Borrower</p>
            <p className="mt-1 font-semibold">{loan.profiles?.full_name}</p>
            <p className="text-sm text-slate-600">{loan.profiles?.email}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Application</p>
            <p className="mt-1 font-semibold">
              {loan.loan_applications?.application_number}
            </p>
            <p className="text-sm text-slate-600">
              {loan.loan_applications?.purpose}
            </p>
          </div>
        </div>
      </section>

      {loan.status === "approved" ? (
        <form
          action={disburseLoan}
          className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6"
        >
          <input type="hidden" name="loanId" value={loan.id} />
          <h2 className="text-lg font-bold text-slate-950">
            Disburse and generate schedule
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This records the disbursement and creates all{" "}
            {loan.repayment_duration_months} monthly installments atomically. It
            does not transfer real funds.
          </p>
          <label className="mt-5 grid max-w-sm gap-2 text-sm font-bold text-slate-700">
            First repayment date
            <input
              type="date"
              name="firstRepaymentDate"
              min={minimumDate}
              defaultValue={defaultFirstDate}
              required
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-normal"
            />
          </label>
          <button className="mt-5 min-h-11 rounded-xl bg-blue-800 px-5 font-bold text-white">
            Mark disbursed
          </button>
        </form>
      ) : null}

      {["disbursed", "active", "overdue", "defaulted"].includes(loan.status) ? (
        <form
          action={recordRepayment}
          className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
        >
          <input type="hidden" name="loanId" value={loan.id} />
          <h2 className="text-lg font-bold text-slate-950">Record repayment</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A permanent transaction will be created and allocated to the oldest
            outstanding installment. Current balance:{" "}
            {formatKobo(loan.outstanding_balance)}.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Amount received (₦)
              <input
                type="number"
                name="amount"
                min="0.01"
                max={loan.outstanding_balance / 100}
                step="0.01"
                required
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Payment method
              <select
                name="paymentMethod"
                required
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-normal"
              >
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Payment date
              <input
                type="date"
                name="paymentDate"
                max={minimumDate}
                defaultValue={minimumDate}
                required
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              External reference (optional)
              <input
                name="paymentReference"
                maxLength={120}
                placeholder="Generated automatically if blank"
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-normal"
              />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
            Notes (optional)
            <textarea
              name="notes"
              maxLength={1000}
              className="min-h-20 rounded-xl border border-slate-300 bg-white p-4 font-normal"
            />
          </label>
          <button className="mt-5 min-h-11 rounded-xl bg-emerald-800 px-5 font-bold text-white">
            Record repayment
          </button>
        </form>
      ) : null}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Repayment schedule</h2>
            <p className="mt-1 text-sm text-slate-600">
              Maturity: {formatDate(loan.maturity_date)}
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Disbursed:{" "}
            {loan.disbursed_at ? formatDate(loan.disbursed_at) : "Not yet"}
          </p>
        </div>
        <ScheduleRows schedule={schedule ?? []} />
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">Repayment transactions</h2>
        {!repayments?.length ? (
          <p className="mt-4 text-sm text-slate-600">
            No repayments recorded yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {repayments.map((payment) => (
              <div
                key={payment.id}
                className="grid gap-2 rounded-xl bg-slate-50 p-4 sm:grid-cols-4 sm:items-center"
              >
                <div>
                  <strong>{payment.payment_reference}</strong>
                  <p className="text-xs text-slate-500 capitalize">
                    {payment.payment_method.replaceAll("_", " ")}
                  </p>
                </div>
                <span>{formatDate(payment.payment_date)}</span>
                <strong>{formatKobo(payment.amount)}</strong>
                <span className="text-sm text-slate-600">
                  {payment.notes ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">Status history</h2>
        <div className="mt-4 grid gap-3">
          {history?.map((entry) => (
            <div key={entry.id} className="rounded-xl bg-slate-50 p-4 text-sm">
              <strong>{entry.new_status.replaceAll("_", " ")}</strong>
              <span className="ml-2 text-slate-500">
                {formatDate(entry.created_at)}
              </span>
              {entry.notes ? (
                <p className="mt-1 text-slate-600">{entry.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ScheduleRows({
  schedule,
}: {
  schedule: Array<{
    id: string | null;
    installment_number: number | null;
    due_date: string | null;
    amount_due: number | null;
    amount_paid: number | null;
    outstanding_amount: number | null;
    effective_status: string | null;
  }>;
}) {
  if (!schedule.length)
    return (
      <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        The schedule will appear after disbursement.
      </p>
    );
  return (
    <div className="mt-5 grid gap-3">
      {schedule.map((item) => (
        <div
          key={item.id}
          className="grid gap-2 rounded-xl border border-slate-100 p-4 sm:grid-cols-5 sm:items-center"
        >
          <strong>Installment {item.installment_number}</strong>
          <span>{formatDate(item.due_date)}</span>
          <span className="text-sm">
            <span className="block text-slate-500">Due</span>
            {formatKobo(item.amount_due ?? 0)}
          </span>
          <span className="text-sm">
            <span className="block text-slate-500">Paid</span>
            {formatKobo(item.amount_paid ?? 0)}
          </span>
          <span className="font-semibold text-slate-600 capitalize">
            {item.effective_status?.replaceAll("_", " ")}
          </span>
        </div>
      ))}
    </div>
  );
}
