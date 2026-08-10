import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

type Props = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

const inputClassName =
  "min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";

export default async function ProfilePage({ searchParams }: Props) {
  const user = await requireUser();
  const { message, error } = await searchParams;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, phone, address, state, occupation, employment_type, business_type",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-3xl">
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Borrower details
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        Your profile
      </h1>
      <p className="mt-3 leading-7 text-slate-600">
        We collect only the information needed for this capstone loan-tracking
        workflow—never BVN, NIN, cards, or bank credentials.
      </p>
      {message ? (
        <p
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      <form
        action={updateProfile}
        className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2 sm:p-8"
      >
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Full name
          <input
            className={inputClassName}
            name="fullName"
            autoComplete="name"
            required
            defaultValue={profile?.full_name ?? ""}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Phone
          <input
            className={inputClassName}
            name="phone"
            autoComplete="tel"
            required
            defaultValue={profile?.phone ?? ""}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
          Address
          <input
            className={inputClassName}
            name="address"
            autoComplete="street-address"
            defaultValue={profile?.address ?? ""}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          State
          <input
            className={inputClassName}
            name="state"
            autoComplete="address-level1"
            required
            defaultValue={profile?.state ?? ""}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Occupation
          <input
            className={inputClassName}
            name="occupation"
            autoComplete="organization-title"
            required
            defaultValue={profile?.occupation ?? ""}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Employment type
          <input
            className={inputClassName}
            name="employmentType"
            placeholder="Self-employed"
            defaultValue={profile?.employment_type ?? ""}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Business type
          <input
            className={inputClassName}
            name="businessType"
            placeholder="Retail provisions"
            defaultValue={profile?.business_type ?? ""}
          />
        </label>
        <button
          type="submit"
          className="min-h-12 rounded-xl bg-emerald-800 px-5 font-bold text-white hover:bg-emerald-900 sm:col-span-2"
        >
          Save borrower profile
        </button>
      </form>
    </div>
  );
}
