import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  APPLICATION_STATUS_LABELS,
  statusBadgeClass,
} from "@/lib/application-status";
import { formatDate } from "@/lib/date";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [
    { data: applications },
    { data: loans },
    { data: repayments },
    { data: schedules },
  ] = await Promise.all([
    supabase
      .from("loan_applications")
      .select(
        "id, application_number, status, requested_amount, created_at, profiles!loan_applications_borrower_id_fkey(full_name)",
      )
      .order("created_at", { ascending: false }),
    supabase.from("loans").select("status, outstanding_balance"),
    supabase.from("repayments").select("amount"),
    supabase
      .from("repayment_schedule_effective")
      .select(
        "id, loan_id, installment_number, due_date, outstanding_amount, effective_status, loans!repayment_schedules_loan_id_fkey(loan_number)",
      )
      .gt("outstanding_amount", 0)
      .order("due_date")
      .limit(6),
  ]);
  const pending =
    applications?.filter((item) =>
      ["submitted", "under_review"].includes(item.status),
    ).length ?? 0;
  const totalRequested =
    applications?.reduce((total, item) => total + item.requested_amount, 0) ??
    0;
  const totalRepaid =
    repayments?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const outstanding =
    loans?.reduce((sum, item) => sum + item.outstanding_balance, 0) ?? 0;
  const summary = [
    ["Total applications", applications?.length ?? 0],
    ["Pending review", pending],
    [
      "Approved",
      applications?.filter((item) => item.status === "approved").length ?? 0,
    ],
    [
      "Rejected",
      applications?.filter((item) => item.status === "rejected").length ?? 0,
    ],
    [
      "Active loans",
      loans?.filter((item) =>
        ["disbursed", "active", "overdue"].includes(item.status),
      ).length ?? 0,
    ],
    [
      "Completed loans",
      loans?.filter((item) =>
        ["fully_repaid", "completed"].includes(item.status),
      ).length ?? 0,
    ],
    ["Outstanding portfolio", formatKobo(outstanding)],
    ["Total repaid", formatKobo(totalRepaid)],
    [
      "Overdue repayments",
      schedules?.filter((item) => item.effective_status === "overdue").length ??
        0,
    ],
  ] as const;

  return (
    <div>
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Loan officer workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        Administrator dashboard
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-600">
        Access is authorized from the protected database role—not browser
        metadata.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Requested application value: {formatKobo(totalRequested)}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/applications"
          className="inline-flex min-h-12 items-center rounded-xl bg-emerald-800 px-5 font-bold text-white"
        >
          Review applications
        </Link>
        <Link
          href="/admin/repayments"
          className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 bg-white px-5 font-bold text-slate-800"
        >
          View repayments
        </Link>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Recent applications</h2>
            <Link
              href="/admin/applications"
              className="text-sm font-bold text-emerald-800"
            >
              View all
            </Link>
          </div>
          {!applications?.length ? (
            <p className="mt-4 text-sm text-slate-600">No applications yet.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {applications.slice(0, 5).map((application) => (
                <Link
                  key={application.id}
                  href={`/admin/applications/${application.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4"
                >
                  <div>
                    <strong>{application.application_number}</strong>
                    <p className="text-sm text-slate-500">
                      {application.profiles?.full_name} ·{" "}
                      {formatDate(application.created_at)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(application.status)}`}
                  >
                    {APPLICATION_STATUS_LABELS[application.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Upcoming / overdue repayments</h2>
          {!schedules?.length ? (
            <p className="mt-4 text-sm text-slate-600">
              No outstanding installments.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {schedules.map((schedule) => (
                <Link
                  key={schedule.id}
                  href={`/admin/loans/${schedule.loan_id}`}
                  className="grid gap-2 rounded-xl bg-slate-50 p-4 sm:grid-cols-3 sm:items-center"
                >
                  <div>
                    <strong>{schedule.loans?.loan_number}</strong>
                    <p className="text-xs text-slate-500">
                      Installment {schedule.installment_number}
                    </p>
                  </div>
                  <span>{formatDate(schedule.due_date)}</span>
                  <strong
                    className={
                      schedule.effective_status === "overdue"
                        ? "text-red-700"
                        : "text-slate-900"
                    }
                  >
                    {formatKobo(schedule.outstanding_amount ?? 0)}
                  </strong>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
