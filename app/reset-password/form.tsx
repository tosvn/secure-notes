"use client";

import { useActionState } from "react";
import { updatePassword, type AuthActionState } from "../login/actions";
import PasswordField from "../password-field";

const initialState: AuthActionState = { message: "", isError: false };

export default function ResetPasswordForm() {
  const [state, action, isPending] = useActionState(
    updatePassword,
    initialState,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <PasswordField
        id="password"
        label="New password"
        name="password"
        autoComplete="new-password"
        minLength={8}
      />
      <PasswordField
        id="confirm-password"
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        minLength={8}
      />
      <button
        className="min-h-12 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Updating password..." : "Update password"}
      </button>
      {state.message && (
        <p
          className={
            state.isError
              ? "text-sm text-rose-700"
              : "text-sm text-emerald-700"
          }
          aria-live="polite"
          role={state.isError ? "alert" : "status"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
