import { Suspense } from "react";
import Link from "next/link";
import ResetPasswordForm from "./form";

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
          className="mb-4 text-sm text-red-700 dark:text-red-400"
          role="alert"
        >
          This password reset link is invalid or has expired. Request a new one.
        </p>
      )}
      <ResetPasswordForm />
      <Link
        className="mt-5 inline-block text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
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
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Set a new password
        </h1>
        <Suspense fallback={<p>Loading password reset form...</p>}>
          <ResetPasswordContent searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
