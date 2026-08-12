import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireUser();
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, profile_completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div>
      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Borrower workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-600">
        Your secure account is ready. Complete your borrower profile before
        submitting a loan request.
      </p>

      {!profile?.profile_completed_at ? (
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-bold text-amber-900">
            Profile setup required
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Add your contact and occupation details so applications contain the
            information an officer needs to review them.
          </p>
          <Link
            href="/profile"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-amber-900 px-5 text-sm font-bold text-white"
          >
            Complete profile
          </Link>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="font-bold text-emerald-900">Profile complete</p>
          <p className="mt-2 text-sm text-emerald-800">
            You can now submit and track a loan request.
          </p>
          <Link
            href="/applications/new"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-800 px-5 text-sm font-bold text-white"
          >
            Apply for a loan
          </Link>
        </section>
      )}
    </div>
  );
}
