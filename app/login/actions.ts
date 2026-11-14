"use server";

import { createHash, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createAdminClient } from "../../lib/supabase/admin";
import { createClient } from "../../lib/supabase/server";

export type AuthActionState = {
  message: string;
  isError: boolean;
  retryAfterSeconds?: number;
  cooldownId?: string;
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

type AuthCallbackUrlResult =
  | { url: string }
  | { error: "missing-site-url" | "invalid-site-url" };

function getAuthCallbackUrl(flow?: "signup"): AuthCallbackUrlResult {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configuredSiteUrl && process.env.NODE_ENV === "production") {
    return { error: "missing-site-url" };
  }

  try {
    const site = new URL(configuredSiteUrl ?? "http://localhost:3000");
    if (site.protocol !== "https:" && site.protocol !== "http:") {
      return { error: "invalid-site-url" };
    }

    const callback = new URL("/auth/callback", site);
    if (flow) {
      callback.searchParams.set("flow", flow);
    }

    return { url: callback.toString() };
  } catch {
    return { error: "invalid-site-url" };
  }
}

function hashEmail(email: string) {
  return createHash("sha256").update(email.toLowerCase()).digest("hex");
}

type LoginRateLimitResult = {
  allowed: boolean;
  retry_after_seconds: number;
  requires_password_reset: boolean;
};

function isLoginRateLimitResult(value: unknown): value is LoginRateLimitResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "allowed" in value &&
    typeof value.allowed === "boolean" &&
    "retry_after_seconds" in value &&
    typeof value.retry_after_seconds === "number" &&
    "requires_password_reset" in value &&
    typeof value.requires_password_reset === "boolean"
  );
}

async function getLoginRateLimit(email: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("check_login_rate_limit", {
    p_email_hash: hashEmail(email),
  });

  if (error) {
    throw new Error(`Unable to check login rate limit: ${error.message}`);
  }

  if (
    !Array.isArray(data) ||
    data.length !== 1 ||
    !isLoginRateLimitResult(data[0])
  ) {
    throw new Error("Unable to check login rate limit: invalid database response.");
  }

  return { admin, state: data[0] };
}

async function clearLoginRateLimit(email: string) {
  const admin = createAdminClient();
  const { error } = await admin.rpc("clear_login_rate_limit", {
    p_email_hash: hashEmail(email),
  });

  if (error) {
    throw new Error(`Unable to clear login rate limit: ${error.message}`);
  }
}

const invalidEmailMessage = "Enter a valid email address.";
const invalidCredentialsMessage =
  "Enter a valid email address and a password of at least 8 characters.";
const emailAlreadyRegisteredMessage =
  "An account with this email already exists.";

function getRateLimitActionState(
  state: LoginRateLimitResult,
): AuthActionState | null {
  if (state.requires_password_reset) {
    return {
      message:
        "Too many failed sign-in attempts. Reset your password to unlock your account.",
      isError: true,
    };
  }

  if (!state.allowed) {
    return {
      message: "Too many failed sign-in attempts.",
      isError: true,
      retryAfterSeconds: state.retry_after_seconds,
      cooldownId: randomUUID(),
    };
  }

  return null;
}

export async function logIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = getCredentials(formData);
  if (!credentials) {
    return { message: invalidCredentialsMessage, isError: true };
  }

  const { admin, state } = await getLoginRateLimit(credentials.email);
  const limitedState = getRateLimitActionState(state);
  if (limitedState) {
    return limitedState;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error?.status === 429) {
    return {
      message: "Too many sign-in requests. Please wait a moment and try again.",
      isError: true,
    };
  }

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        message:
          "Please confirm your email before logging in. " +
          "Check your inbox for the confirmation link.",
        isError: true,
      };
    }

    if (error.code !== "invalid_credentials") {
      throw new Error(`Unable to log in: ${error.message}`);
    }

    const { data: failureState, error: rateLimitError } = await admin
      .rpc("record_login_failure", {
        p_email_hash: hashEmail(credentials.email),
      })
      .single();

    if (rateLimitError) {
      throw new Error(`Unable to record failed login: ${rateLimitError.message}`);
    }

    if (!isLoginRateLimitResult(failureState)) {
      throw new Error("Unable to record failed login: invalid database response.");
    }

    const failureActionState = getRateLimitActionState(failureState);
    if (failureActionState) {
      return failureActionState;
    }

    return { message: "Wrong email or password.", isError: true };
  }

  await clearLoginRateLimit(credentials.email);
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

  const callback = getAuthCallbackUrl("signup");
  if ("error" in callback) {
    return {
      message: "Email confirmation is not configured. Please contact support.",
      isError: true,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: { emailRedirectTo: callback.url },
  });

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
        "If this is a new account, check your email for a confirmation link before logging in.",
      isError: false,
    };
  }

  redirect("/");
}

export async function requestPasswordReset(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getEmail(formData);
  if (email === null) {
    return { message: invalidEmailMessage, isError: true };
  }

  const callback = getAuthCallbackUrl();
  if ("error" in callback) {
    return {
      message:
        callback.error === "missing-site-url"
          ? "Password reset is not configured. Please contact support."
          : "Password reset is not configured correctly.",
      isError: true,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callback.url,
  });

  if (error) {
    return {
      message: `Unable to send password reset email: ${error.message}`,
      isError: true,
    };
  }

  return {
    message:
      "If an account exists for that email, a password reset link has been sent.",
    isError: false,
  };
}

export async function updatePassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = formData.get("password");
  const confirmation = formData.get("confirmPassword");

  if (
    typeof password !== "string" ||
    [...password].length < passwordMinimumLength
  ) {
    return {
      message: `Choose a password with at least ${passwordMinimumLength} characters.`,
      isError: true,
    };
  }

  if (password !== confirmation) {
    return { message: "The passwords do not match.", isError: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Unable to verify password reset session: ${userError.message}`);
  }

  if (!user?.email) {
    return {
      message: "This password reset link is invalid or has expired. Request a new one.",
      isError: true,
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      message: `Unable to update password: ${error.message}`,
      isError: true,
    };
  }

  await clearLoginRateLimit(user.email);

  const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
  if (signOutError) {
    throw new Error(
      `Password was updated, but unable to finish reset flow: ${signOutError.message}`,
    );
  }

  redirect("/login");
}
