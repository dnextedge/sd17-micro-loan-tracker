const DATE_FORMATTER = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

export function formatDate(value: string | null) {
  if (!value) return "Not set";
  return DATE_FORMATTER.format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

export function dateInputAfterDays(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
