import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();

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
        metadata. Application review tools arrive in the next workflow phase.
      </p>
    </div>
  );
}
