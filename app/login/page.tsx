"use client";

import { useActionState } from "react";
import { logIn, type AuthActionState } from "./actions";
import Link from "next/link";
import PasswordField from "../password-field";
import Brand from "../brand";

const initialState: AuthActionState = { message: "", isError: false };

export default function LoginPage() {
  const [state, action, isPending] = useActionState(logIn, initialState);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_-30px_rgba(54,65,112,0.28)] backdrop-blur sm:p-10">
        <Brand />
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">
          Your notes are right where you left them.
        </p>
        <form action={action} autoComplete="off" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              maxLength={254}
              required
            />
          </div>
          <PasswordField
            id="password"
            label="Password"
            name="password"
            autoComplete="off"
            minLength={8}
          />
          <button
            className="mt-2 min-h-12 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Log in"}
          </button>
        </form>
        {state.message && (
          <p
            className={`mt-4 text-sm ${
              state.isError ? "text-rose-700" : "text-emerald-700"
            }`}
            aria-live="polite"
            role={state.isError ? "alert" : "status"}
          >
            {state.message}
          </p>
        )}
        <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
            href="/signup"
          >
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
