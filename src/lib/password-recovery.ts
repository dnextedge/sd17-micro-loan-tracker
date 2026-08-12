export const RECOVERY_COOKIE_NAME = "loantrack-recovery";

export function recoveryCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
