const NGN_FORMATTER = new Intl.NumberFormat("en-NG", {
  currency: "NGN",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "currency",
});

export function parseNairaToKobo(value: string) {
  const normalized = value.trim().replaceAll(",", "");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);

  if (!match) return null;

  const naira = BigInt(match[1] ?? "0");
  const kobo = BigInt((match[2] ?? "").padEnd(2, "0"));
  const total = naira * BigInt(100) + kobo;

  return total <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(total) : null;
}

export function formatKobo(value: number) {
  return NGN_FORMATTER.format(value / 100);
}
