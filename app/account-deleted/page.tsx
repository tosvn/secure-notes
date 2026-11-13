import Link from "next/link";
import Brand from "../brand";

export default function AccountDeletedPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_70px_-30px_rgba(54,65,112,0.28)] backdrop-blur sm:p-10">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg
            aria-hidden="true"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="m5 12 4 4L19 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
          Account deleted
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your account and all its notes have been permanently deleted.
        </p>
        <Link
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          href="/signup"
        >
          Create a new account
        </Link>
      </section>
    </main>
  );
}
