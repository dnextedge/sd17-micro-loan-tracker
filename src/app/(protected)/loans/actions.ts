"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { parseNairaToKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

function field(formData: FormData, name: string) {
  const entry = formData.get(name);
  return typeof entry === "string" ? entry : "";
}

const interestRate = z
  .string()
  .trim()
  .regex(/^\d{1,3}(?:\.\d{1,4})?$/)
  .transform(Number)
  .refine((value) => value >= 0 && value <= 100);

export async function createLoanFromApplication(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({
      applicationId: z.string().uuid(),
      interestRate,
    })
    .safeParse({
      applicationId: field(formData, "applicationId"),
      interestRate: field(formData, "interestRate"),
    });

  if (!parsed.success) {
    redirect("/admin/applications?error=Check+the+loan+terms");
  }

  const supabase = await createClient();
  const { data: loanId, error } = await supabase.rpc(
    "create_loan_from_application",
    {
      p_application_id: parsed.data.applicationId,
      p_interest_rate: parsed.data.interestRate,
    },
  );

  if (error || !loanId) {
    redirect(
      `/admin/applications/${parsed.data.applicationId}?error=The+loan+could+not+be+created`,
    );
  }

  redirect(`/admin/loans/${loanId}?message=Approved+loan+created`);
}

export async function disburseLoan(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({
      firstRepaymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      loanId: z.string().uuid(),
    })
    .safeParse({
      firstRepaymentDate: field(formData, "firstRepaymentDate"),
      loanId: field(formData, "loanId"),
    });

  if (!parsed.success) {
    redirect("/admin/loans?error=Check+the+disbursement+information");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("disburse_loan", {
    p_first_repayment_date: parsed.data.firstRepaymentDate,
    p_loan_id: parsed.data.loanId,
  });

  if (error) {
    redirect(
      `/admin/loans/${parsed.data.loanId}?error=The+loan+could+not+be+disbursed`,
    );
  }

  redirect(
    `/admin/loans/${parsed.data.loanId}?message=Loan+disbursed+and+repayment+schedule+generated`,
  );
}

const paymentMethod = z.enum(["cash", "bank_transfer", "other"]);

export async function recordRepayment(formData: FormData) {
  await requireAdmin();
  const amount = parseNairaToKobo(field(formData, "amount"));
  const parsed = z
    .object({
      loanId: z.string().uuid(),
      paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      paymentMethod,
      paymentReference: z.string().trim().max(120),
      notes: z.string().trim().max(1000),
    })
    .safeParse({
      loanId: field(formData, "loanId"),
      paymentDate: field(formData, "paymentDate"),
      paymentMethod: field(formData, "paymentMethod"),
      paymentReference: field(formData, "paymentReference"),
      notes: field(formData, "notes"),
    });

  if (!parsed.success || amount === null || amount <= 0) {
    redirect("/admin/loans?error=Check+the+repayment+information");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_repayment", {
    p_amount: amount,
    p_loan_id: parsed.data.loanId,
    ...(parsed.data.notes ? { p_notes: parsed.data.notes } : {}),
    p_payment_date: parsed.data.paymentDate,
    p_payment_method: parsed.data.paymentMethod,
    ...(parsed.data.paymentReference
      ? { p_payment_reference: parsed.data.paymentReference }
      : {}),
  });

  if (error) {
    redirect(
      `/admin/loans/${parsed.data.loanId}?error=The+repayment+could+not+be+recorded`,
    );
  }

  redirect(
    `/admin/loans/${parsed.data.loanId}?message=Repayment+recorded+and+balance+updated`,
  );
}

export async function completeLoan(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({
      loanId: z.string().uuid(),
      notes: z.string().trim().max(1000),
    })
    .safeParse({
      loanId: field(formData, "loanId"),
      notes: field(formData, "notes"),
    });

  if (!parsed.success) {
    redirect("/admin/loans?error=Check+the+completion+information");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_loan", {
    p_loan_id: parsed.data.loanId,
    ...(parsed.data.notes ? { p_notes: parsed.data.notes } : {}),
  });

  if (error) {
    redirect(
      `/admin/loans/${parsed.data.loanId}?error=The+loan+could+not+be+completed`,
    );
  }

  redirect(
    `/admin/loans/${parsed.data.loanId}?message=Loan+lifecycle+completed`,
  );
}
