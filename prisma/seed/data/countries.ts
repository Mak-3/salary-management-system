export const COUNTRIES = [
  "India",
  "USA",
  "Germany",
  "UK",
  "Canada",
] as const;

export type Country = (typeof COUNTRIES)[number];

export const countryCurrency: Record<Country, string> = {
  India: "INR",
  USA: "USD",
  Germany: "EUR",
  UK: "GBP",
  Canada: "CAD",
};

export const countrySalaryRanges: Record<Country, [number, number]> = {
  India: [400_000, 2_500_000],
  USA: [60_000, 220_000],
  Germany: [50_000, 140_000],
  UK: [45_000, 130_000],
  Canada: [55_000, 150_000],
};
