/** Vibrant palette — maps to CSS variables in globals.css */
export const CHART_COLOR_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
] as const;

export function chartColorAt(index: number): string {
  return CHART_COLOR_VARS[index % CHART_COLOR_VARS.length];
}
