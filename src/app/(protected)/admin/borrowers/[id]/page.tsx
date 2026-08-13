import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  APPLICATION_STATUS_LABELS,
  statusBadgeClass,
} from "@/lib/application-status";
import { formatDate } from "@/lib/date";
import { LOAN_STATUS_LABELS, loanStatusBadgeClass } from "@/lib/loan-status";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function AdminBorrowerDetails({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: borrower }, { data: applications }, { data: loans }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("loan_applications")
        .select(
          "id, application_number, requested_amount, purpose, status, created_at",
        )
        .eq("borrower_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("loans")
        .select(
          "id, loan_number, principal_amount, amount_repaid, outstanding_balance, status, created_at",
        )
        .eq("borrower_id", id)
        .order("created_at", { ascending: false }),
    ]);
  if (!borrower) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/borrowers"
        className="text-sm font-bold text-emerald-800"
      >
        ← Borrowers
      </Link>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
          Borrower profile
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          {borrower.full_name ?? "Borrower"}
        </h1>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Email" value={borrower.email} />
          <Detail label="Phone" value={borrower.phone} />
          <Detail label="State" value={borrower.state} />
          <Detail label="Occupation" value={borrower.occupation} />
          <Detail
            label="Employment"
            value={borrower.employment_type?.replaceAll("_", " ")}
          />
          <Detail label="Business type" value={borrower.business_type} />
        </div>
        <div className="mt-6 border-t border-slate-100 pt-5">
          <Detail label="Address" value={borrower.address} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">Applications</h2>
        {!applications?.length ? (
          <p className="mt-4 text-sm text-slate-600">No applications yet.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {applications.map((application) => (
              <Link
                key={application.id}
                href={`/admin/applications/${application.id}`}
                className="grid gap-2 rounded-xl bg-slate-50 p-4 sm:grid-cols-4 sm:items-center"
              >
                <strong>{application.application_number}</strong>
                <span>{formatDate(application.created_at)}</span>
                <strong>{formatKobo(application.requested_amount)}</strong>
                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(application.status)}`}
                >
                  {APPLICATION_STATUS_LABELS[application.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">Loans</h2>
        {!loans?.length ? (
          <p className="mt-4 text-sm text-slate-600">No loans yet.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {loans.map((loan) => (
              <Link
                key={loan.id}
                href={`/admin/loans/${loan.id}`}
                className="grid gap-2 rounded-xl bg-slate-50 p-4 sm:grid-cols-4 sm:items-center"
              >
                <strong>{loan.loan_number}</strong>
                <span>Repaid {formatKobo(loan.amount_repaid)}</span>
                <span>Outstanding {formatKobo(loan.outstanding_balance)}</span>
                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${loanStatusBadgeClass(loan.status)}`}
                >
                  {LOAN_STATUS_LABELS[loan.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-slate-900 capitalize">{value || "—"}</p>
    </div>
  );
}
