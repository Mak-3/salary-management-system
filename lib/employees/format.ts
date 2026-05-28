const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: string) {
  let f = formatters.get(currency);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    formatters.set(currency, f);
  }
  return f;
}

export function formatSalary(salary: number, currency: string): string {
  try {
    return formatterFor(currency).format(salary);
  } catch {
    return `${salary.toLocaleString()} ${currency}`;
  }
}

export function formatJoinedAt(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
