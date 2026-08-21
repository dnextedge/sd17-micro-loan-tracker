import { describe, expect, it } from "vitest";
import { safeNextPath } from "./auth-redirect";

describe("safeNextPath", () => {
  it("allows an internal application path", () => {
    expect(safeNextPath("/loans/123?tab=schedule")).toBe(
      "/loans/123?tab=schedule",
    );
  });

  it.each([
    "https://attacker.example",
    "//attacker.example/path",
    "javascript:alert(1)",
    "dashboard",
    null,
  ])("rejects unsafe redirect target %s", (target) => {
    expect(safeNextPath(target)).toBe("/dashboard");
  });
});
