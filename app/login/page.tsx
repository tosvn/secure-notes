"use client";

import { useActionState } from "react";
import { logIn, signUp, type AuthActionState } from "./actions";

const initialState: AuthActionState = { message: "" };

export default function LoginPage() {
  const [loginState, loginAction, isLoggingIn] = useActionState(
    logIn,
    initialState,
  );
  const [signUpState, signUpAction, isSigningUp] = useActionState(
    signUp,
    initialState,
  );

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Secure Notes
        </h1>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              className="flex-1 rounded-lg bg-blue-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              formAction={loginAction}
              disabled={isLoggingIn || isSigningUp}
            >
              {isLoggingIn ? "Logging in..." : "Log in"}
            </button>
            <button
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 font-medium text-zinc-800 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
              type="submit"
              formAction={signUpAction}
              disabled={isLoggingIn || isSigningUp}
            >
              {isSigningUp ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </form>
        {(loginState.message || signUpState.message) && (
          <div className="mt-4 flex flex-col gap-2" aria-live="polite">
            {loginState.message && (
              <p className="text-sm text-red-700 dark:text-red-400">
                {loginState.message}
              </p>
            )}
            {signUpState.message && (
              <p className="text-sm text-red-700 dark:text-red-400">
                {signUpState.message}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
