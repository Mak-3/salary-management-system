import type { BarChartItem, ChartSegment, DistributionChart } from "./types";

export type CountRow = {
  label: string;
  count: number;
};

export type ValueRow = {
  label: string;
  value: number;
};

import { chartColorAt } from "./colors";

export function buildDistributionChart(rows: CountRow[]): DistributionChart {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const sorted = [...rows].sort((a, b) => b.count - a.count);

  const segments: ChartSegment[] = sorted.map((row, index) => ({
    label: row.label,
    value: row.count,
    percentage:
      total === 0
        ? 0
        : Math.round((row.count / total) * 1000) / 10,
    fill: chartColorAt(index),
  }));

  return { total, segments };
}

export function buildBarChart(rows: ValueRow[]): BarChartItem[] {
  const sorted = [...rows].sort((a, b) => b.value - a.value);

  return sorted.map((row, index) => ({
    label: row.label,
    value: row.value,
    fill: chartColorAt(index),
  }));
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On leave",
  terminated: "Terminated",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export function formatGroupLabel(value: string | null): string {
  if (value === null) return "Unassigned";
  if (value in STATUS_LABELS) return STATUS_LABELS[value];
  if (value in EMPLOYMENT_LABELS) return EMPLOYMENT_LABELS[value];
  return value;
}
