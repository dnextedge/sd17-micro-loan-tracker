import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { LOAN_STATUS_LABELS, loanStatusBadgeClass } from "@/lib/loan-status";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function LoanDetails({ params }: Props) {
  await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: loan }, { data: schedule }] = await Promise.all([
    supabase
      .from("loans")
      .select(
        "*, loan_applications!loans_loan_application_id_fkey(application_number, purpose)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("repayment_schedule_effective")
      .select("*")
      .eq("loan_id", id)
      .order("installment_number"),
  ]);
  if (!loan) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/loans" className="text-sm font-bold text-emerald-800">
        ← My loans
      </Link>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500">
              {loan.loan_number}
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {formatKobo(loan.outstanding_balance)}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Outstanding balance</p>
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
            label="Total repayable"
            value={formatKobo(loan.total_repayable)}
          />
          <Metric
            label="Amount repaid"
            value={formatKobo(loan.amount_repaid)}
          />
          <Metric
            label="Installment"
            value={formatKobo(loan.installment_amount)}
          />
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-sm font-bold text-slate-500">Purpose</p>
          <p className="mt-1">{loan.loan_applications?.purpose}</p>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Repayment schedule</h2>
            <p className="mt-1 text-sm text-slate-600">
              Maturity: {formatDate(loan.maturity_date)}
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Application: {loan.loan_applications?.application_number}
          </p>
        </div>
        {!schedule?.length ? (
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Your repayment schedule will appear after disbursement.
          </p>
        ) : (
          <div className="mt-5 grid gap-3">
            {schedule.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 rounded-xl border border-slate-100 p-4 sm:grid-cols-4 sm:items-center"
              >
                <strong>Installment {item.installment_number}</strong>
                <span>{formatDate(item.due_date)}</span>
                <span>{formatKobo(item.amount_due ?? 0)}</span>
                <span className="font-semibold text-slate-600 capitalize">
                  {item.effective_status?.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
