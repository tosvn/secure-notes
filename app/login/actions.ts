"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export type AuthActionState = {
  message: string;
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
    return { message: invalidCredentialsMessage };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { message: "Wrong email or password." };
  }

  redirect("/");
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = getCredentials(formData);
  if (!credentials) {
    return { message: invalidCredentialsMessage };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(credentials);

  if (error) {
    return { message: error.message };
  }

  redirect("/");
}
