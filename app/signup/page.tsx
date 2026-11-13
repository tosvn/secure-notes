"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthActionState } from "../login/actions";
import PasswordField from "../password-field";
import Brand from "../brand";

const initialState: AuthActionState = { message: "", isError: false };

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUp, initialState);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_-30px_rgba(54,65,112,0.28)] backdrop-blur sm:p-10">
        <Brand />
        <h1 className="mb-2 mt-8 text-3xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mb-6 text-sm leading-6 text-slate-500">
          A calm, private home for everything you want to remember.
        </p>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="signup-email"
            >
              Email
            </label>
            <input
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
            <span className="text-xs text-slate-500">
              Use at least 8 characters.
            </span>
          </div>
          <button
            className="mt-2 min-h-12 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                ? "text-rose-700"
                : "text-emerald-700"
            }`}
            aria-live="polite"
            role={state.isError ? "alert" : "status"}
          >
            {state.message}
          </p>
        )}
        <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
            href="/login"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
