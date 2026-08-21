import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?message=Please+sign+in+to+continue");
  }

  return user;
}

export const getCurrentRole = cache(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.role ?? null;
});

export async function requireAdmin() {
  const user = await requireUser();
  const role = await getCurrentRole();

  if (role !== "admin") {
    redirect("/dashboard?error=Administrator+access+is+required");
  }

  return user;
}
