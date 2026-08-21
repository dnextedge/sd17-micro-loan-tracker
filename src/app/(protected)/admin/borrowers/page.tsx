import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ q?: string; state?: string }> };

export default async function AdminBorrowersPage({ searchParams }: Props) {
  await requireAdmin();
  const { q = "", state = "" } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, state, occupation, employment_type, profile_completed_at, created_at",
    )
    .order("created_at", { ascending: false });
  if (state.trim()) query = query.eq("state", state.trim());
  const { data } = await query;
  const search = q.trim().toLocaleLowerCase();
  const borrowers = (
    search
      ? data?.filter((borrower) =>
          [borrower.full_name, borrower.email, borrower.phone].some((value) =>
            value?.toLocaleLowerCase().includes(search),
          ),
        )
      : data
  )?.filter((borrower) => borrower.profile_completed_at);
  const states = [
    ...new Set(data?.map((item) => item.state).filter(Boolean)),
  ].sort();

  return (
    <div>
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Loan officer workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold">Borrowers</h1>
      <p className="mt-3 text-slate-600">
        View completed borrower profiles and their loan records.
      </p>
      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_220px_auto_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Name, email, or phone"
          className="min-h-11 rounded-xl border border-slate-300 px-4"
        />
        <select
          name="state"
          defaultValue={state}
          className="min-h-11 rounded-xl border border-slate-300 px-4"
        >
          <option value="">All states</option>
          {states.map((stateName) => (
            <option key={stateName} value={stateName ?? ""}>
              {stateName}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-xl bg-slate-900 px-5 font-bold text-white">
          Filter borrowers
        </button>
        <Link
          href="/admin/borrowers"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 font-bold text-slate-700"
        >
          Clear
        </Link>
      </form>
      {!borrowers?.length ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No borrowers match these filters.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {borrowers.map((borrower) => (
            <Link
              key={borrower.id}
              href={`/admin/borrowers/${borrower.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300"
            >
              <h2 className="font-bold text-slate-950">
                {borrower.full_name ?? "Borrower"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{borrower.email}</p>
              <p className="text-sm text-slate-600">{borrower.phone}</p>
              <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <p>{borrower.occupation ?? "Occupation not provided"}</p>
                <p>{borrower.state ?? "State not provided"}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Registered {formatDate(borrower.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
