import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  APPLICATION_STATUS_LABELS,
  statusBadgeClass,
  type ApplicationStatus,
} from "@/lib/application-status";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ error?: string; q?: string; status?: string }>;
};

export default async function AdminApplicationsPage({ searchParams }: Props) {
  await requireAdmin();
  const { error, q = "", status = "" } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("loan_applications")
    .select(
      "id, application_number, requested_amount, purpose, status, submitted_at, profiles!loan_applications_borrower_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false });
  if (status && status in APPLICATION_STATUS_LABELS)
    query = query.eq("status", status as ApplicationStatus);
  if (q.trim())
    query = query.or(
      `application_number.ilike.%${q.trim()}%,purpose.ilike.%${q.trim()}%`,
    );
  const { data: applications } = await query;

  return (
    <div>
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Loan officer workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        Loan applications
      </h1>
      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_220px_auto]">
        <input
          name="q"
          defaultValue={q}
          className="min-h-11 rounded-xl border border-slate-300 px-4"
          placeholder="Application number or purpose"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-h-11 rounded-xl border border-slate-300 px-4"
        >
          <option value="">All application statuses</option>
          {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-xl bg-slate-900 px-5 font-bold text-white">
          Filter applications
        </button>
      </form>
      <div className="mt-6 grid gap-4">
        {applications?.map((application) => (
          <Link
            href={`/admin/applications/${application.id}`}
            key={application.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-950">
                  {application.application_number}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {application.profiles?.full_name ?? "Borrower"}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(application.status)}`}
              >
                {APPLICATION_STATUS_LABELS[application.status]}
              </span>
            </div>
            <p className="mt-3 text-xl font-bold">
              {formatKobo(application.requested_amount)}
            </p>
            <p className="mt-1 line-clamp-1 text-sm text-slate-600">
              {application.purpose}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
