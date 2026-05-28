import type { ChartConfig } from "@/components/ui/chart";

import type { BarChartItem, ChartSegment } from "./types";

export type RechartsRow = {
  key: string;
  label: string;
  value: number;
  fill: string;
};

export function segmentsToChartData(segments: ChartSegment[]): {
  config: ChartConfig;
  data: RechartsRow[];
} {
  const config: ChartConfig = {};
  const data: RechartsRow[] = [];

  for (const [index, segment] of segments.entries()) {
    const key = toChartKey(segment.label, index);
    config[key] = { label: segment.label, color: segment.fill };
    data.push({
      key,
      label: segment.label,
      value: segment.value,
      fill: `var(--color-${key})`,
    });
  }

  return { config, data };
}

export function barsToChartData(items: BarChartItem[]): {
  config: ChartConfig;
  data: RechartsRow[];
} {
  const config: ChartConfig = {
    value: { label: "Count" },
  };
  const data: RechartsRow[] = [];

  for (const [index, item] of items.entries()) {
    const key = toChartKey(item.label, index);
    config[key] = { label: item.label, color: item.fill };
    data.push({
      key,
      label: item.label,
      value: item.value,
      fill: `var(--color-${key})`,
    });
  }

  return { config, data };
}

function toChartKey(label: string, index: number): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return slug || `item_${index}`;
}
