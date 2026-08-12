import { AuthCard } from "../_components/auth-card";
import { RecoveryForm } from "./recovery-form";

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
      <RecoveryForm />
    </AuthCard>
  );
}
