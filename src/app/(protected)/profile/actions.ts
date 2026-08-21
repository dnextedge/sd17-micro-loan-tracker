"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import {
  buildFullName,
  EMPLOYMENT_TYPES,
  NIGERIAN_STATES,
} from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/server";

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((entry) => entry || null);

const profileSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  middleName: optionalText(60),
  lastName: z.string().trim().min(2).max(60),
  phone: z.string().trim().min(7).max(20),
  address: optionalText(500),
  state: z.enum(NIGERIAN_STATES),
  occupation: z.string().trim().min(2).max(120),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  businessType: optionalText(120),
});

function field(formData: FormData, name: string) {
  const entry = formData.get(name);
  return typeof entry === "string" ? entry : "";
}

export async function updateProfile(formData: FormData) {
  const parsed = profileSchema.safeParse({
    firstName: field(formData, "firstName"),
    middleName: field(formData, "middleName"),
    lastName: field(formData, "lastName"),
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
      first_name: parsed.data.firstName,
      middle_name: parsed.data.middleName,
      last_name: parsed.data.lastName,
      full_name: buildFullName(parsed.data),
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
