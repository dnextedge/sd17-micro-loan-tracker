import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { submitLoanApplication } from "../actions";

type Props = { searchParams: Promise<{ error?: string }> };

const fieldClass =
  "min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";

export default async function NewApplicationPage({ searchParams }: Props) {
  const user = await requireUser();
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.profile_completed_at) {
    redirect("/profile?error=Complete+your+profile+before+applying");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/applications" className="text-sm font-bold text-emerald-800">
        ← My applications
      </Link>
      <p className="mt-6 text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        New loan request
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        Apply for a micro-loan
      </h1>
      <p className="mt-3 leading-7 text-slate-600">
        LoanTrack NG records and tracks requests. It is not a licensed lender
        and does not disburse real funds.
      </p>
      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
      <form
        action={submitLoanApplication}
        className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2 sm:p-8"
      >
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Requested amount (₦)
          <input
            className={fieldClass}
            name="requestedAmount"
            inputMode="decimal"
            placeholder="120,000"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Repayment duration
          <select
            className={fieldClass}
            name="repaymentDurationMonths"
            defaultValue="6"
            required
          >
            {[1, 2, 3, 4, 5, 6, 9, 12, 18, 24].map((month) => (
              <option key={month} value={month}>
                {month} {month === 1 ? "month" : "months"}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
          Loan purpose
          <textarea
            className={`${fieldClass} min-h-32 py-3`}
            name="purpose"
            minLength={10}
            maxLength={1000}
            placeholder="Purchase additional business inventory"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Preferred start date{" "}
          <span className="font-normal text-slate-500">(optional)</span>
          <input
            className={fieldClass}
            name="preferredStartDate"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
          Additional notes{" "}
          <span className="font-normal text-slate-500">(optional)</span>
          <textarea
            className={`${fieldClass} min-h-24 py-3`}
            name="borrowerNotes"
            maxLength={2000}
          />
        </label>
        <button
          className="min-h-12 rounded-xl bg-emerald-800 px-5 font-bold text-white hover:bg-emerald-900 sm:col-span-2"
          type="submit"
        >
          Submit loan application
        </button>
      </form>
    </div>
  );
}
