import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth-redirect";
import {
  RECOVERY_COOKIE_NAME,
  recoveryCookieOptions,
} from "@/lib/password-recovery";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const isRecovery = requestUrl.searchParams.get("flow") === "recovery";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(new URL(next, requestUrl.origin));

      if (isRecovery && next === "/update-password") {
        response.cookies.set(
          RECOVERY_COOKIE_NAME,
          "verified",
          recoveryCookieOptions(),
        );
      }

      return response;
    }
  }

  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set(
    "error",
    "The authentication link is invalid or has expired.",
  );
  return NextResponse.redirect(loginUrl);
}
