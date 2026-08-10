"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((entry) => entry || null);

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  address: optionalText(500),
  state: z.string().trim().min(2).max(80),
  occupation: z.string().trim().min(2).max(120),
  employmentType: optionalText(80),
  businessType: optionalText(120),
});

function field(formData: FormData, name: string) {
  const entry = formData.get(name);
  return typeof entry === "string" ? entry : "";
}

export async function updateProfile(formData: FormData) {
  const parsed = profileSchema.safeParse({
    fullName: field(formData, "fullName"),
    phone: field(formData, "phone"),
    address: field(formData, "address"),
    state: field(formData, "state"),
    occupation: field(formData, "occupation"),
    employmentType: field(formData, "employmentType"),
    businessType: field(formData, "businessType"),
  });

  if (!parsed.success) {
    redirect(
      `/profile?error=${encodeURIComponent("Check the highlighted profile information.")}`,
    );
  }

  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      address: parsed.data.address,
      state: parsed.data.state,
      occupation: parsed.data.occupation,
      employment_type: parsed.data.employmentType,
      business_type: parsed.data.businessType,
      email: user.email ?? null,
      profile_completed_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    redirect(
      `/profile?error=${encodeURIComponent("Profile could not be saved.")}`,
    );
  }

  redirect("/profile?message=Profile+saved+successfully");
}
