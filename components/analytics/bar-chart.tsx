"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_ANIMATION } from "@/components/analytics/chart-motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { barsToChartData } from "@/lib/analytics/chart-data";
import type { BarChartItem } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

type ValueFormat = "number" | "currency";

type AnalyticsBarChartProps = {
  items: BarChartItem[];
  valueFormat?: ValueFormat;
  className?: string;
};

export function AnalyticsBarChart({
  items,
  valueFormat = "number",
  className,
}: AnalyticsBarChartProps) {
  const formatValue = (value: number) => formatChartValue(value, valueFormat);

  if (items.length === 0) {
    return (
      <p className={cn("py-12 text-center text-sm text-muted-foreground", className)}>
        No data available
      </p>
    );
  }

  const { config, data } = barsToChartData(items);

  return (
    <ChartContainer
      config={config}
      className={cn("aspect-auto h-[300px] w-full", className)}
      initialDimension={{ width: 400, height: 300 }}
    >
      <RechartsBarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 16 }}
      >
        <defs>
          {data.map((entry) => (
            <linearGradient
              key={entry.key}
              id={`bar-gradient-${entry.key}`}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor={entry.fill} stopOpacity={0.75} />
              <stop offset="100%" stopColor={entry.fill} stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/40" />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatValue(Number(value))}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={100}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.35 }}
          content={
            <ChartTooltipContent
              nameKey="key"
              formatter={(value) => (
                <span className="font-mono font-medium tabular-nums">
                  {formatValue(Number(value))}
                </span>
              )}
            />
          }
        />
        <Bar
          dataKey="value"
          radius={[0, 8, 8, 0]}
          barSize={26}
          isAnimationActive
          animationDuration={CHART_ANIMATION.duration}
          animationEasing={CHART_ANIMATION.easing}
          animationBegin={CHART_ANIMATION.begin}
        >
          {data.map((entry) => (
            <Cell
              key={entry.key}
              fill={`url(#bar-gradient-${entry.key})`}
              style={{
                filter: "drop-shadow(0 2px 6px oklch(0 0 0 / 0.12))",
              }}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ChartContainer>
  );
}

function formatChartValue(value: number, format: ValueFormat): string {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return value.toLocaleString();
}
