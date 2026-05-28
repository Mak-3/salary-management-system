"use client";

import { Pie, PieChart as RechartsPieChart } from "recharts";

import { CHART_ANIMATION } from "@/components/analytics/chart-motion";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { segmentsToChartData } from "@/lib/analytics/chart-data";
import type { DistributionChart } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

type DistributionPieChartProps = {
  chart: DistributionChart;
  className?: string;
};

export function DistributionPieChart({
  chart,
  className,
}: DistributionPieChartProps) {
  if (chart.total === 0) {
    return (
      <p className={cn("py-12 text-center text-sm text-muted-foreground", className)}>
        No data available
      </p>
    );
  }

  const { config, data } = segmentsToChartData(chart.segments);

  return (
    <ChartContainer
      config={config}
      className={cn("mx-auto aspect-square max-h-[340px] w-full", className)}
    >
      <RechartsPieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="key"
              formatter={(value, _name, item) => {
                const segment = chart.segments.find(
                  (s) => s.label === item.payload?.label,
                );
                const pct = segment?.percentage ?? 0;
                return (
                  <span className="font-mono font-medium tabular-nums">
                    {Number(value).toLocaleString()} ({pct}%)
                  </span>
                );
              }}
            />
          }
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="key"
          innerRadius={64}
          outerRadius={108}
          paddingAngle={4}
          cornerRadius={6}
          strokeWidth={0}
          isAnimationActive
          animationDuration={CHART_ANIMATION.duration}
          animationEasing={CHART_ANIMATION.easing}
          animationBegin={CHART_ANIMATION.begin}
        />
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
      </RechartsPieChart>
    </ChartContainer>
  );
}
