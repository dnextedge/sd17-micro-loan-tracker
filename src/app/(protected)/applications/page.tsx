import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  APPLICATION_STATUS_LABELS,
  statusBadgeClass,
} from "@/lib/application-status";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export default async function ApplicationsPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("loan_applications")
    .select(
      "id, application_number, requested_amount, purpose, status, submitted_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
            Borrower workspace
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            My applications
          </h1>
          <p className="mt-3 text-slate-600">
            Track every request and its current review status.
          </p>
        </div>
        <Link
          href="/applications/new"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-800 px-5 font-bold text-white"
        >
          Apply for a loan
        </Link>
      </div>
      {!applications?.length ? (
        <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="font-bold text-slate-950">No loan applications yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Submit your first request to begin the tracked workflow.
          </p>
        </section>
      ) : (
        <div className="mt-8 grid gap-4">
          {applications.map((application) => (
            <Link
              key={application.id}
              href={`/applications/${application.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-bold text-slate-950">
                  {application.application_number}
                </p>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(application.status)}`}
                >
                  {APPLICATION_STATUS_LABELS[application.status]}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {formatKobo(application.requested_amount)}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {application.purpose}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
