import type { ReactNode } from "react";

export function AuthCard({
  eyebrow,
  title,
  description,
  message,
  error,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  message?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.45)] sm:p-8">
      <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
      {message ? (
        <p
          role="status"
          className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
      <div className="mt-7">{children}</div>
    </div>
  );
}

export function FormField({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 transition outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

export const submitClassName =
  "min-h-12 w-full rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800";
