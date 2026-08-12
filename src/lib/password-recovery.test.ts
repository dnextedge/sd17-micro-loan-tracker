import { describe, expect, it } from "vitest";
import {
  RECOVERY_COOKIE_NAME,
  recoveryCookieOptions,
} from "./password-recovery";

describe("password recovery marker", () => {
  it("uses a short-lived HTTP-only same-site cookie", () => {
    expect(RECOVERY_COOKIE_NAME).toBe("loantrack-recovery");
    expect(recoveryCookieOptions()).toMatchObject({
      httpOnly: true,
      maxAge: 600,
      path: "/",
      sameSite: "lax",
    });
  });
});
