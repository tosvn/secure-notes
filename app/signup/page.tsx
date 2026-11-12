"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthActionState } from "../login/actions";
import PasswordField from "../password-field";

const initialState: AuthActionState = { message: "", isError: false };

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUp, initialState);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Create your account
        </h1>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Sign up to start keeping your notes private.
        </p>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              htmlFor="signup-email"
            >
              Email
            </label>
            <input
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <PasswordField
              id="signup-password"
              label="Password"
              name="password"
              autoComplete="new-password"
              minLength={8}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Use at least 8 characters.
            </span>
          </div>
          <button
            className="mt-2 rounded-lg bg-blue-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>
        {state.message && (
          <p
            className={`mt-4 text-sm ${
              state.isError
                ? "text-red-700 dark:text-red-400"
                : "text-green-700 dark:text-green-400"
            }`}
            aria-live="polite"
            role={state.isError ? "alert" : "status"}
          >
            {state.message}
          </p>
        )}
        <p className="mt-6 border-t border-zinc-200 pt-5 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            className="font-medium text-blue-700 hover:underline dark:text-blue-400"
            href="/login"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
