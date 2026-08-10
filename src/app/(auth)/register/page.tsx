import Link from "next/link";
import { AuthCard, FormField, submitClassName } from "../_components/auth-card";
import { register } from "../actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <AuthCard
      eyebrow="Borrower registration"
      title="Create your account"
      description="Start with the essentials. LoanTrack NG does not collect BVN, NIN, or bank credentials."
      error={error}
    >
      <form action={register} className="grid gap-5">
        <FormField
          label="Full name"
          name="fullName"
          autoComplete="name"
          placeholder="Emem James"
        />
        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
        />
        <p className="text-xs leading-5 text-slate-500">
          Use at least 8 characters. Never reuse your banking password.
        </p>
        <button type="submit" className={submitClassName}>
          Create borrower account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-bold text-emerald-800">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
