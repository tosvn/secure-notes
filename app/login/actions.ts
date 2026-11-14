"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export type AuthActionState = {
  message: string;
  isError: boolean;
};

const passwordMinimumLength = 8;

function getEmail(formData: FormData) {
  const email = formData.get("email");

  if (
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return null;
  }

  return email.trim();
}

function getCredentials(formData: FormData) {
  const email = getEmail(formData);
  const password = formData.get("password");

  if (
    email === null ||
    typeof password !== "string" ||
    [...password].length < passwordMinimumLength
  ) {
    return null;
  }

  return { email, password };
}

const invalidCredentialsMessage =
  "Enter a valid email address and a password of at least 8 characters.";
const emailAlreadyRegisteredMessage =
  "An account with this email already exists.";

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
    if (error.code === "invalid_credentials") {
      return { message: "Wrong email or password.", isError: true };
    }

    throw new Error(`Unable to log in: ${error.message}`);
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
    if (
      error.code === "user_already_exists" ||
      error.message === "User already registered"
    ) {
      return { message: emailAlreadyRegisteredMessage, isError: true };
    }

    return { message: error.message, isError: true };
  }

  if (data.user?.identities?.length === 0) {
    return { message: emailAlreadyRegisteredMessage, isError: true };
  }

  if (!data.session) {
    return {
      message:
        "Email confirmation is still enabled in Supabase. Disable it in your Auth settings for instant signup.",
      isError: true,
    };
  }

  redirect("/");
}
