"use client";

import { useActionState, useEffect, useState } from "react";
import {
  logIn,
  requestPasswordReset,
  type AuthActionState,
} from "./actions";
import Link from "next/link";
import PasswordField from "../password-field";
import Brand from "../brand";

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
    <div className="flex w-full flex-col gap-3">
      <button
        className="min-h-12 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
        <p className="text-center text-sm text-rose-700" role="status">
          Too many failed sign-in attempts. Try again in {secondsRemaining}{" "}
          seconds.
        </p>
      )}
    </div>
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
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_-30px_rgba(54,65,112,0.28)] backdrop-blur sm:p-10">
        <Brand />
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">
          Your notes are right where you left them.
        </p>
        <form className="flex flex-col gap-4">
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
          <div className="pt-2">
            <LoginButton
              key={loginState.cooldownId ?? "ready"}
              action={loginAction}
              isPending={isLoggingIn || isRequestingReset}
              cooldownSeconds={loginState.retryAfterSeconds ?? 0}
            />
          </div>
          <button
            className="border-t border-slate-100 pt-4 text-left text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
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
                    ? "text-sm text-rose-700"
                    : "text-sm text-emerald-700"
                }
              >
                {loginState.message}
              </p>
            )}
            {resetState.message && (
              <p
                className={
                  resetState.isError
                    ? "text-sm text-rose-700"
                    : "text-sm text-emerald-700"
                }
                role={resetState.isError ? "alert" : "status"}
              >
                {resetState.message}
              </p>
            )}
          </div>
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
