"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAppUrl } from "@/lib/env";
import { RECOVERY_COOKIE_NAME } from "@/lib/password-recovery";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email().max(254);
const passwordSchema = z.string().min(8).max(72);

function value(formData: FormData, name: string) {
  const entry = formData.get(name);
  return typeof entry === "string" ? entry : "";
}

function authRedirect(
  path: string,
  kind: "error" | "message",
  message: string,
): never {
  redirect(`${path}?${kind}=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  const parsed = z
    .object({ email: emailSchema, password: passwordSchema })
    .safeParse({
      email: value(formData, "email"),
      password: value(formData, "password"),
    });

  if (!parsed.success) {
    authRedirect("/login", "error", "Enter a valid email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    authRedirect("/login", "error", "The email or password is incorrect.");
  }

  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const parsed = z
    .object({
      fullName: z.string().trim().min(2).max(120),
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: passwordSchema,
    })
    .refine((input) => input.password === input.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    })
    .safeParse({
      fullName: value(formData, "fullName"),
      email: value(formData, "email"),
      password: value(formData, "password"),
      confirmPassword: value(formData, "confirmPassword"),
    });

  if (!parsed.success) {
    authRedirect(
      "/register",
      "error",
      parsed.error.issues[0]?.message ?? "Check the registration details.",
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    authRedirect("/register", "error", "Registration could not be completed.");
  }

  if (data.session) {
    redirect("/dashboard");
  }

  authRedirect(
    "/login",
    "message",
    "Check your email to confirm your account, then sign in.",
  );
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = emailSchema.safeParse(value(formData, "email"));

  if (!parsed.success) {
    authRedirect("/forgot-password", "error", "Enter a valid email address.");
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/update-password&flow=recovery`,
  });

  authRedirect(
    "/forgot-password",
    "message",
    "If the account exists, a password-reset link has been sent.",
  );
}

export async function updatePassword(formData: FormData) {
  const cookieStore = await cookies();

  if (cookieStore.get(RECOVERY_COOKIE_NAME)?.value !== "verified") {
    authRedirect("/login", "error", "The password-reset session has expired.");
  }

  const parsed = z
    .object({ password: passwordSchema, confirmPassword: passwordSchema })
    .refine((input) => input.password === input.confirmPassword, {
      message: "Passwords do not match.",
    })
    .safeParse({
      password: value(formData, "password"),
      confirmPassword: value(formData, "confirmPassword"),
    });

  if (!parsed.success) {
    authRedirect(
      "/update-password",
      "error",
      parsed.error.issues[0]?.message ?? "Enter a valid password.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    authRedirect("/login", "error", "The password-reset session has expired.");
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    authRedirect("/update-password", "error", "Password could not be updated.");
  }

  await supabase.auth.signOut();
  cookieStore.delete(RECOVERY_COOKIE_NAME);
  authRedirect("/login", "message", "Password updated. You can now sign in.");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?message=You+have+been+signed+out");
}
