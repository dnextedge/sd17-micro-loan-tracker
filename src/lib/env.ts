const PLACEHOLDER_MARKERS = ["your-project-ref", "your-supabase-anon-key"];

function requiredPublicValue(name: string, value: string | undefined) {
  if (!value || PLACEHOLDER_MARKERS.some((marker) => value.includes(marker))) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: requiredPublicValue(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    anonKey: requiredPublicValue(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function getAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return "http://localhost:3000";
}
