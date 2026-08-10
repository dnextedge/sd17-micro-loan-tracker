import { AuthCard, FormField, submitClassName } from "../_components/auth-card";
import { updatePassword } from "../actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <AuthCard
      eyebrow="Secure your account"
      title="Choose a new password"
      description="Your reset link must still be valid to complete this change."
      error={error}
    >
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
    </AuthCard>
  );
}
