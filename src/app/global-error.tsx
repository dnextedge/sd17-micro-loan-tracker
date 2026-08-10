"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center px-6 font-sans">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold">LoanTrack NG is unavailable</h1>
            <p className="mt-4 text-slate-600">
              An unexpected error occurred. Please try again.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 min-h-11 rounded-xl bg-emerald-800 px-5 font-semibold text-white"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
