import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  const isSignupConfirmation =
    request.nextUrl.searchParams.get("flow") === "signup";
  const code = request.nextUrl.searchParams.get("code");
  const invalidLinkUrl = new URL(
    isSignupConfirmation
      ? "/signup?error=confirmation-link"
      : "/reset-password?error=invalid-link",
    request.url,
  );

  if (!code) {
    return NextResponse.redirect(invalidLinkUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(invalidLinkUrl);
  }

  return NextResponse.redirect(
    new URL(isSignupConfirmation ? "/" : "/reset-password", request.url),
  );
}
