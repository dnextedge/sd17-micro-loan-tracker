import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireUser();
  const { error } = await searchParams;
  const supabase = await createClient();
  const [{ data: profile }, { data: loans }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, profile_completed_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("loans")
      .select(
        "id, loan_number, principal_amount, amount_repaid, outstanding_balance, status",
      )
      .order("created_at", { ascending: false })
      .limit(1),
  ]);
  const activeLoan = loans?.[0];
  const { data: nextSchedule } = activeLoan
    ? await supabase
        .from("repayment_schedule_effective")
        .select("due_date, outstanding_amount, effective_status")
        .eq("loan_id", activeLoan.id)
        .gt("outstanding_amount", 0)
        .order("installment_number")
        .limit(1)
        .maybeSingle()
    : { data: null };

  return (
    <div>
      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Borrower workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-600">
        Your secure account is ready. Complete your borrower profile before
        submitting a loan request.
      </p>

      {!profile?.profile_completed_at ? (
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-bold text-amber-900">
            Profile setup required
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Add your contact and occupation details so applications contain the
            information an officer needs to review them.
          </p>
          <Link
            href="/profile"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-amber-900 px-5 text-sm font-bold text-white"
          >
            Complete profile
          </Link>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="font-bold text-emerald-900">Profile complete</p>
          <p className="mt-2 text-sm text-emerald-800">
            You can now submit and track a loan request.
          </p>
          <Link
            href="/applications/new"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-800 px-5 text-sm font-bold text-white"
          >
            Apply for a loan
          </Link>
        </section>
      )}
      {activeLoan ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500">Current loan</p>
              <h2 className="mt-1 text-xl font-bold">
                {activeLoan.loan_number}
              </h2>
            </div>
            <Link
              href={`/loans/${activeLoan.id}`}
              className="font-bold text-emerald-800"
            >
              View loan →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardMetric
              label="Principal"
              value={formatKobo(activeLoan.principal_amount)}
            />
            <DashboardMetric
              label="Amount repaid"
              value={formatKobo(activeLoan.amount_repaid)}
            />
            <DashboardMetric
              label="Outstanding"
              value={formatKobo(activeLoan.outstanding_balance)}
            />
            <DashboardMetric
              label="Next repayment"
              value={
                nextSchedule
                  ? `${formatKobo(nextSchedule.outstanding_amount ?? 0)} · ${formatDate(nextSchedule.due_date)}`
                  : "Completed"
              }
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DashboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
