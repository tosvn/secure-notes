"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export type AuthActionState = {
  message: string;
  isError: boolean;
};

function getCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    [...password].length < 8
  ) {
    return null;
  }

  return { email: email.trim(), password };
}

const invalidCredentialsMessage =
  "Enter a valid email address and a password of at least 8 characters.";

export async function logIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = getCredentials(formData);
  if (!credentials) {
    return { message: invalidCredentialsMessage, isError: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        message:
          "Please confirm your email before logging in. " +
          "Check your inbox for the confirmation link.",
        isError: true,
      };
    }

    return { message: "Wrong email or password.", isError: true };
  }

  redirect("/");
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = getCredentials(formData);
  if (!credentials) {
    return { message: invalidCredentialsMessage, isError: true };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    return { message: error.message, isError: true };
  }

  if (!data.session) {
    return {
      message:
        "If this is a new account, check your email for a confirmation link before logging in.",
      isError: false,
    };
  }

  redirect("/");
}
