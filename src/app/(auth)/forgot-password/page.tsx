import Link from "next/link";
import { AuthCard, FormField, submitClassName } from "../_components/auth-card";
import { requestPasswordReset } from "../actions";

type Props = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { message, error } = await searchParams;

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email. For privacy, the confirmation is the same whether or not the address exists."
      message={message}
      error={error}
    >
      <form action={requestPasswordReset} className="grid gap-5">
        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <button type="submit" className={submitClassName}>
          Send reset link
        </button>
      </form>
      <Link
        href="/login"
        className="mt-6 block text-center text-sm font-bold text-emerald-800"
      >
        Return to sign in
      </Link>
    </AuthCard>
  );
}
