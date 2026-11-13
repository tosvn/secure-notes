import { Suspense } from "react";
import Link from "next/link";
import ResetPasswordForm from "./form";
import Brand from "../brand";

async function ResetPasswordContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const params = await searchParams;
  const invalidLink = params.error === "invalid-link";

  return (
    <>
      {invalidLink && (
        <p
          className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
          role="alert"
        >
          This password reset link is invalid or has expired. Request a new one.
        </p>
      )}
      <ResetPasswordForm />
      <Link
        className="mt-5 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        href="/login"
      >
        Back to login
      </Link>
    </>
  );
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_-30px_rgba(54,65,112,0.28)] backdrop-blur sm:p-10">
        <Brand />
        <h1 className="mb-6 mt-8 text-3xl font-bold tracking-tight text-slate-900">
          Set a new password
        </h1>
        <Suspense fallback={<p>Loading password reset form...</p>}>
          <ResetPasswordContent searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
