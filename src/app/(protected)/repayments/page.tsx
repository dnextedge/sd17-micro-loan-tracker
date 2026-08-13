import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { formatKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export default async function RepaymentsPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: repayments } = await supabase
    .from("repayments")
    .select(
      "id, loan_id, payment_reference, amount, payment_method, payment_date, loans!repayment_loan_borrower_fk(loan_number)",
    )
    .order("created_at", { ascending: false });
  const total =
    repayments?.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;

  return (
    <div>
      <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase">
        Borrower workspace
      </p>
      <h1 className="mt-3 text-3xl font-bold">Repayments</h1>
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-bold text-emerald-800">Total repaid</p>
        <p className="mt-2 text-3xl font-bold text-emerald-950">
          {formatKobo(total)}
        </p>
      </div>
      {!repayments?.length ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No repayments recorded yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-3">
          {repayments.map((payment) => (
            <Link
              key={payment.id}
              href={`/loans/${payment.loan_id}`}
              className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300 sm:grid-cols-4"
            >
              <div>
                <strong>{payment.payment_reference}</strong>
                <p className="text-sm text-slate-500">
                  {payment.loans?.loan_number}
                </p>
              </div>
              <span>{formatDate(payment.payment_date)}</span>
              <span className="capitalize">
                {payment.payment_method.replaceAll("_", " ")}
              </span>
              <strong>{formatKobo(payment.amount)}</strong>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
