import { afterEach, describe, expect, it } from "vitest";
import { getAppUrl, getSupabasePublicEnv } from "./env";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("public environment validation", () => {
  it("rejects unconfigured Supabase placeholders", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL =
      "https://your-project-ref.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-supabase-anon-key";

    expect(() => getSupabasePublicEnv()).toThrow("is not configured");
  });

  it("returns configured Supabase values", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";

    expect(getSupabasePublicEnv()).toEqual({
      url: "https://project.supabase.co",
      anonKey: "public-anon-key",
    });
  });

  it("normalizes the configured application URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://loantrack.example/";
    expect(getAppUrl()).toBe("https://loantrack.example");
  });
});
