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
        className="rounded-lg bg-blue-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Updating password..." : "Update password"}
      </button>
      {state.message && (
        <p
          className={
            state.isError
              ? "text-sm text-red-700 dark:text-red-400"
              : "text-sm text-green-700 dark:text-green-400"
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
