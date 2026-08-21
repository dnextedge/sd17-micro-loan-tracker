import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  APPLICATION_STATUS_LABELS,
  statusBadgeClass,
} from "@/lib/application-status";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

export default async function ApplicationDetailsPage({
  params,
  searchParams,
}: Props) {
  await requireUser();
  const [{ id }, { message }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: application } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!application) notFound();

  const { data: history } = await supabase
    .from("loan_status_history")
    .select("id, new_status, notes, created_at")
    .eq("entity_type", "loan_application")
    .eq("entity_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/applications" className="text-sm font-bold text-emerald-800">
        ← My applications
      </Link>
      {message ? (
        <p
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {message}
        </p>
      ) : null}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500">
              {application.application_number}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {formatKobo(application.requested_amount)}
            </h1>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-sm font-bold ${statusBadgeClass(application.status)}`}
          >
            {APPLICATION_STATUS_LABELS[application.status]}
          </span>
        </div>
        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-bold text-slate-500">Purpose</dt>
            <dd className="mt-2 leading-7 text-slate-900">
              {application.purpose}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-slate-500">Duration</dt>
            <dd className="mt-2 text-slate-900">
              {application.repayment_duration_months} months
            </dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-slate-500">
              Preferred start
            </dt>
            <dd className="mt-2 text-slate-900">
              {application.preferred_start_date ?? "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-slate-500">Submitted</dt>
            <dd className="mt-2 text-slate-900">
              {application.submitted_at
                ? new Date(application.submitted_at).toLocaleDateString("en-NG")
                : "—"}
            </dd>
          </div>
        </dl>
        {application.admin_notes ? (
          <div className="mt-8 rounded-xl bg-blue-50 p-4">
            <p className="text-sm font-bold text-blue-900">Loan officer note</p>
            <p className="mt-2 text-sm leading-6 text-blue-800">
              {application.admin_notes}
            </p>
          </div>
        ) : null}
      </div>
      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-950">Status history</h2>
        <div className="mt-4 grid gap-3">
          {history?.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="font-bold text-slate-900">
                {APPLICATION_STATUS_LABELS[
                  item.new_status as keyof typeof APPLICATION_STATUS_LABELS
                ] ?? item.new_status}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(item.created_at).toLocaleString("en-NG")}
              </p>
              {item.notes ? (
                <p className="mt-2 text-sm text-slate-600">{item.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
