import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  APPLICATION_STATUS_LABELS,
  statusBadgeClass,
  type ApplicationStatus,
} from "@/lib/application-status";
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

export default async function AdminApplicationsPage({ searchParams }: Props) {
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
    .from("loan_applications")
    .select(
      "id, application_number, requested_amount, purpose, status, submitted_at, profiles!loan_applications_borrower_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false });
  if (status && status in APPLICATION_STATUS_LABELS)
    query = query.eq("status", status as ApplicationStatus);
  if (minimum !== null) query = query.gte("requested_amount", minimum);
  if (maximum !== null) query = query.lte("requested_amount", maximum);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom))
    query = query.gte("created_at", `${dateFrom}T00:00:00Z`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo))
    query = query.lte("created_at", `${dateTo}T23:59:59.999Z`);
  const { data } = await query;
  const search = q.trim().toLocaleLowerCase();
  const applications = search
    ? data?.filter((application) =>
        [
          application.application_number,
          application.purpose,
          application.profiles?.full_name,
        ].some((value) => value?.toLocaleLowerCase().includes(search)),
      )
    : data;

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
      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          className="min-h-11 rounded-xl border border-slate-300 px-4"
          placeholder="Borrower, application, or purpose"
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
          Filter applications
        </button>
        <Link
          href="/admin/applications"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 font-bold text-slate-700"
        >
          Clear filters
        </Link>
      </form>
      {!applications?.length ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No applications match these filters.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {applications.map((application) => (
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
      )}
    </div>
  );
}
