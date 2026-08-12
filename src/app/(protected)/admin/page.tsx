import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("loan_applications")
    .select("status, requested_amount");
  const pending =
    applications?.filter((item) =>
      ["submitted", "under_review"].includes(item.status),
    ).length ?? 0;
  const totalRequested =
    applications?.reduce((total, item) => total + item.requested_amount, 0) ??
    0;

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
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-500">Total applications</p>
          <p className="mt-2 text-3xl font-bold">{applications?.length ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-500">Pending review</p>
          <p className="mt-2 text-3xl font-bold">{pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-500">
            Requested portfolio
          </p>
          <p className="mt-2 text-2xl font-bold">
            {formatKobo(totalRequested)}
          </p>
        </div>
      </div>
      <Link
        href="/admin/applications"
        className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-emerald-800 px-5 font-bold text-white"
      >
        Review applications
      </Link>
    </div>
  );
}
