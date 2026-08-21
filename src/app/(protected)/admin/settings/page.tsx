import { requireAdmin } from "@/lib/auth";

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Loan officer workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold">MVP settings</h1>
      <p className="mt-3 text-slate-600">
        Operational boundaries configured for the SD-17 demonstration.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Setting label="Currency" value="NGN / Nigerian naira" />
        <Setting label="Money storage" value="Integer minor units (kobo)" />
        <Setting label="Repayment frequency" value="Monthly" />
        <Setting
          label="Demo interest"
          value="0% default; set during approval"
        />
        <Setting
          label="Payment methods"
          value="Cash, bank transfer, or other"
        />
        <Setting label="Payment processing" value="Manual tracking only" />
      </div>
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="font-bold">Submission boundary</h2>
        <p className="mt-2 text-sm leading-6">
          LoanTrack NG is a tracking and management system, not a licensed
          lender. It does not transfer funds or collect card, BVN, NIN, or bank
          login information.
        </p>
      </div>
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
