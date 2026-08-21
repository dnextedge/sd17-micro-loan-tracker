import Link from "next/link";
import { AuthCard, FormField, submitClassName } from "../_components/auth-card";
import { login } from "../actions";

type Props = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { message, error } = await searchParams;

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in"
      description="Access your LoanTrack NG workspace securely."
      message={message}
      error={error}
    >
      <form action={login} className="grid gap-5">
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
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
          >
            Forgot password?
          </Link>
        </div>
        <button type="submit" className={submitClassName}>
          Sign in securely
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        New to LoanTrack NG?{" "}
        <Link href="/register" className="font-bold text-emerald-800">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
