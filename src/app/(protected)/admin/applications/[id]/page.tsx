import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  APPLICATION_STATUS_LABELS,
  statusBadgeClass,
} from "@/lib/application-status";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { reviewLoanApplication } from "@/app/(protected)/applications/actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function AdminApplicationDetails({
  params,
  searchParams,
}: Props) {
  await requireAdmin();
  const [{ id }, { error, message }] = await Promise.all([
    params,
    searchParams,
  ]);
  const supabase = await createClient();
  const { data: application } = await supabase
    .from("loan_applications")
    .select(
      "*, profiles!loan_applications_borrower_id_fkey(full_name, phone, email, state, occupation, employment_type)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!application) notFound();

  const allowed =
    application.status === "submitted"
      ? (["under_review"] as const)
      : application.status === "under_review"
        ? (["submitted", "approved", "rejected"] as const)
        : [];
  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/applications"
        className="text-sm font-bold text-emerald-800"
      >
        ← Applications
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
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500">
              {application.application_number}
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {formatKobo(application.requested_amount)}
            </h1>
          </div>
          <span
            className={`h-fit rounded-full border px-3 py-1 text-sm font-bold ${statusBadgeClass(application.status)}`}
          >
            {APPLICATION_STATUS_LABELS[application.status]}
          </span>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-slate-500">Borrower</p>
            <p className="mt-2 font-semibold">
              {application.profiles?.full_name}
            </p>
            <p className="text-sm text-slate-600">
              {application.profiles?.occupation} · {application.profiles?.state}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Purpose</p>
            <p className="mt-2 leading-6">{application.purpose}</p>
          </div>
        </div>
      </div>
      {allowed.length ? (
        <form
          action={reviewLoanApplication}
          className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <input type="hidden" name="applicationId" value={application.id} />
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Officer notes
            <textarea
              name="adminNotes"
              defaultValue={application.admin_notes ?? ""}
              maxLength={2000}
              className="min-h-28 rounded-xl border border-slate-300 p-4 font-normal"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            {allowed.map((status) => (
              <button
                key={status}
                name="status"
                value={status}
                className="min-h-11 rounded-xl bg-emerald-800 px-5 font-bold text-white"
              >
                {status === "submitted"
                  ? "Request more information"
                  : APPLICATION_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </form>
      ) : null}
    </div>
  );
}
