import { describe, expect, it } from "vitest";

import { barsToChartData, segmentsToChartData } from "./chart-data";

describe("segmentsToChartData", () => {
  it("maps segments to shadcn chart config and recharts rows", () => {
    const { config, data } = segmentsToChartData([
      {
        label: "USA",
        value: 10,
        percentage: 66.7,
        fill: "var(--chart-1)",
      },
      {
        label: "On leave",
        value: 5,
        percentage: 33.3,
        fill: "var(--chart-2)",
      },
    ]);

    expect(config.usa).toEqual({ label: "USA", color: "var(--chart-1)" });
    expect(config.on_leave).toEqual({ label: "On leave", color: "var(--chart-2)" });
    expect(data).toHaveLength(2);
    expect(data[0]?.fill).toBe("var(--color-usa)");
  });
});

describe("barsToChartData", () => {
  it("maps bar items to chart rows with per-bar colors", () => {
    const { data } = barsToChartData([
      { label: "Engineering", value: 12, fill: "var(--chart-1)" },
    ]);

    expect(data[0]?.value).toBe(12);
    expect(data[0]?.fill).toBe("var(--color-engineering)");
  });
});
