"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { parseNairaToKobo } from "@/lib/money";
import { requireAdmin, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((entry) => entry || null);

function field(formData: FormData, name: string) {
  const entry = formData.get(name);
  return typeof entry === "string" ? entry : "";
}

export async function submitLoanApplication(formData: FormData) {
  await requireUser();
  const amount = parseNairaToKobo(field(formData, "requestedAmount"));
  const parsed = z
    .object({
      purpose: z.string().trim().min(10).max(1000),
      repaymentDurationMonths: z.coerce.number().int().min(1).max(24),
      preferredStartDate: z
        .string()
        .trim()
        .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value))
        .transform((value) => value || null),
      borrowerNotes: optionalText(2000),
    })
    .safeParse({
      purpose: field(formData, "purpose"),
      repaymentDurationMonths: field(formData, "repaymentDurationMonths"),
      preferredStartDate: field(formData, "preferredStartDate"),
      borrowerNotes: field(formData, "borrowerNotes"),
    });

  if (!parsed.success || amount === null || amount < 100_000) {
    redirect("/applications/new?error=Check+the+loan+application+information");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_loan_application", {
    ...(parsed.data.borrowerNotes
      ? { p_borrower_notes: parsed.data.borrowerNotes }
      : {}),
    ...(parsed.data.preferredStartDate
      ? { p_preferred_start_date: parsed.data.preferredStartDate }
      : {}),
    p_purpose: parsed.data.purpose,
    p_repayment_duration_months: parsed.data.repaymentDurationMonths,
    p_requested_amount: amount,
  });

  if (error || !data) {
    redirect(
      "/applications/new?error=The+loan+application+could+not+be+submitted",
    );
  }

  redirect(`/applications/${data}?message=Application+submitted+successfully`);
}

const adminStatuses = z.enum([
  "under_review",
  "submitted",
  "approved",
  "rejected",
]);

export async function reviewLoanApplication(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({
      applicationId: z.string().uuid(),
      status: adminStatuses,
      adminNotes: optionalText(2000),
    })
    .safeParse({
      applicationId: field(formData, "applicationId"),
      status: field(formData, "status"),
      adminNotes: field(formData, "adminNotes"),
    });

  if (!parsed.success) {
    redirect("/admin/applications?error=Invalid+review+request");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_loan_application", {
    ...(parsed.data.adminNotes
      ? { p_admin_notes: parsed.data.adminNotes }
      : {}),
    p_application_id: parsed.data.applicationId,
    p_new_status: parsed.data.status,
  });

  if (error) {
    redirect(
      `/admin/applications/${parsed.data.applicationId}?error=The+status+could+not+be+updated`,
    );
  }

  redirect(
    `/admin/applications/${parsed.data.applicationId}?message=Application+status+updated`,
  );
}
