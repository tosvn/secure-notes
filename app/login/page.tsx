"use client";

import { useActionState, useEffect, useState } from "react";
import {
  logIn,
  requestPasswordReset,
  type AuthActionState,
} from "./actions";
import Link from "next/link";
import PasswordField from "../password-field";

const initialState: AuthActionState = { message: "", isError: false };

type FormAction = (formData: FormData) => void | Promise<void>;

function LoginButton({
  action,
  isPending,
  cooldownSeconds,
}: {
  action: FormAction;
  isPending: boolean;
  cooldownSeconds: number;
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(cooldownSeconds);

  useEffect(() => {
    if (cooldownSeconds === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsRemaining((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return remaining - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  return (
    <>
      <button
        className="flex-1 rounded-lg bg-blue-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        formAction={action}
        disabled={isPending || secondsRemaining > 0}
      >
        {isPending
          ? "Logging in..."
          : secondsRemaining > 0
            ? `Try again in ${secondsRemaining}s`
            : "Log in"}
      </button>
      {secondsRemaining > 0 && (
        <p className="text-sm text-red-700 dark:text-red-400" role="status">
          Too many failed sign-in attempts. Try again in {secondsRemaining}{" "}
          seconds.
        </p>
      )}
    </>
  );
}

export default function LoginPage() {
  const [loginState, loginAction, isLoggingIn] = useActionState(
    logIn,
    initialState,
  );
  const [resetState, resetAction, isRequestingReset] = useActionState(
    requestPasswordReset,
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
              maxLength={254}
              required
            />
          </div>
          <PasswordField
            id="password"
            label="Password"
            name="password"
            autoComplete="current-password"
            minLength={8}
          />
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <LoginButton
              key={loginState.cooldownId ?? "ready"}
              action={loginAction}
              isPending={isLoggingIn || isRequestingReset}
              cooldownSeconds={loginState.retryAfterSeconds ?? 0}
            />
          </div>
          <button
            className="border-t border-zinc-200 pt-4 text-left text-sm font-medium text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-blue-400"
            type="submit"
            formAction={resetAction}
            formNoValidate
            disabled={isRequestingReset || isLoggingIn}
          >
            {isRequestingReset ? "Sending reset link..." : "Reset password"}
          </button>
        </form>
        {(loginState.message || resetState.message) && (
          <div className="mt-4 flex flex-col gap-2" aria-live="polite">
            {loginState.message && loginState.retryAfterSeconds === undefined && (
              <p
                className={
                  loginState.isError
                    ? "text-sm text-red-700 dark:text-red-400"
                    : "text-sm text-green-700 dark:text-green-400"
                }
              >
                {loginState.message}
              </p>
            )}
            {resetState.message && (
              <p
                className={
                  resetState.isError
                    ? "text-sm text-red-700 dark:text-red-400"
                    : "text-sm text-green-700 dark:text-green-400"
                }
                role={resetState.isError ? "alert" : "status"}
              >
                {resetState.message}
              </p>
            )}
          </div>
        )}
        <p className="mt-6 border-t border-zinc-200 pt-5 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            className="font-medium text-blue-700 hover:underline dark:text-blue-400"
            href="/signup"
          >
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
