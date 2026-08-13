import { requireAdmin } from "@/lib/auth";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReportsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: loans }, { data: repayments }, { data: schedules }] =
    await Promise.all([
      supabase
        .from("loans")
        .select("status, principal_amount, amount_repaid, outstanding_balance"),
      supabase.from("repayments").select("amount, payment_method"),
      supabase
        .from("repayment_schedule_effective")
        .select("effective_status, outstanding_amount"),
    ]);
  const principal =
    loans?.reduce((sum, item) => sum + item.principal_amount, 0) ?? 0;
  const repaid = repayments?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const outstanding =
    loans?.reduce((sum, item) => sum + item.outstanding_balance, 0) ?? 0;
  const overdue =
    schedules
      ?.filter((item) => item.effective_status === "overdue")
      .reduce((sum, item) => sum + (item.outstanding_amount ?? 0), 0) ?? 0;

  return (
    <div>
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Loan officer workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold">Portfolio report</h1>
      <p className="mt-3 text-slate-600">
        Live operational totals from authorized PostgreSQL records.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Principal issued" value={formatKobo(principal)} />
        <Metric label="Total repaid" value={formatKobo(repaid)} />
        <Metric label="Outstanding" value={formatKobo(outstanding)} />
        <Metric label="Overdue amount" value={formatKobo(overdue)} />
      </div>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">Loan status distribution</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "approved",
            "disbursed",
            "active",
            "overdue",
            "fully_repaid",
            "completed",
            "defaulted",
            "cancelled",
          ].map((status) => (
            <div key={status} className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500 capitalize">
                {status.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {loans?.filter((loan) => loan.status === status).length ?? 0}
              </p>
            </div>
          ))}
        </div>
      </section>
      <p className="mt-5 text-sm text-slate-500">
        MVP operational report only. It is not an accounting or regulatory
        statement.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
