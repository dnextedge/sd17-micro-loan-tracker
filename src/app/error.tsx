"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface)] px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-bold tracking-widest text-red-700 uppercase">
          Something went wrong
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          We could not load this page
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Try the request again. If it continues, return later or contact the
          administrator.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 min-h-11 rounded-xl bg-emerald-800 px-5 font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
