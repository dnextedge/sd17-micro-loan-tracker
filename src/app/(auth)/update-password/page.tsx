import { cookies } from "next/headers";
import { RECOVERY_COOKIE_NAME } from "@/lib/password-recovery";
import { AuthCard } from "../_components/auth-card";
import { FormField, submitClassName } from "../_components/auth-card";
import { updatePassword } from "../actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const recoveryVerified =
    cookieStore.get(RECOVERY_COOKIE_NAME)?.value === "verified";

  return (
    <AuthCard
      eyebrow="Secure your account"
      title="Choose a new password"
      description="Your reset link must still be valid to complete this change."
      error={error}
    >
      {recoveryVerified ? (
        <form action={updatePassword} className="grid gap-5">
          <FormField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
          />
          <FormField
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
          />
          <button type="submit" className={submitClassName}>
            Update password
          </button>
        </form>
      ) : (
        <p role="alert" className="text-sm text-red-800">
          This password-reset link is invalid or has expired. Request a new link
          from the sign-in page.
        </p>
      )}
    </AuthCard>
  );
}
