import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface)] px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-bold tracking-widest text-emerald-700 uppercase">
          404
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          Page not found
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          The LoanTrack NG page you requested does not exist.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-emerald-800 px-5 font-semibold text-white"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
