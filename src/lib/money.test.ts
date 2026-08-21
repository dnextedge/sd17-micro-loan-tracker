import { describe, expect, it } from "vitest";
import { formatKobo, parseNairaToKobo } from "./money";

describe("NGN money helpers", () => {
  it("parses whole naira and decimal kobo using integer arithmetic", () => {
    expect(parseNairaToKobo("120,000")).toBe(12_000_000);
    expect(parseNairaToKobo("120000.50")).toBe(12_000_050);
  });

  it("rejects malformed or over-precise values", () => {
    expect(parseNairaToKobo("-20000")).toBeNull();
    expect(parseNairaToKobo("200.005")).toBeNull();
    expect(parseNairaToKobo("abc")).toBeNull();
  });

  it("formats kobo as Nigerian naira", () => {
    expect(formatKobo(12_000_000)).toContain("120,000");
  });
});
