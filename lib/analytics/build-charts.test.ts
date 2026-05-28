import { describe, expect, it } from "vitest";

import {
  buildBarChart,
  buildDistributionChart,
  formatGroupLabel,
} from "./build-charts";

describe("buildDistributionChart", () => {
  it("builds segments with percentages sorted by count descending", () => {
    const chart = buildDistributionChart([
      { label: "India", count: 5 },
      { label: "USA", count: 10 },
      { label: "UK", count: 5 },
    ]);

    expect(chart.total).toBe(20);
    expect(chart.segments).toHaveLength(3);
    expect(chart.segments[0]).toMatchObject({
      label: "USA",
      value: 10,
      percentage: 50,
    });
    expect(chart.segments[1]?.label).toBe("India");
    expect(chart.segments[1]?.percentage).toBe(25);
    expect(chart.segments[2]?.label).toBe("UK");
    expect(chart.segments.every((s) => s.fill.startsWith("var(--chart-"))).toBe(
      true,
    );
  });

  it("returns an empty chart when there are no rows", () => {
    const chart = buildDistributionChart([]);

    expect(chart).toEqual({ total: 0, segments: [] });
  });
});

describe("buildBarChart", () => {
  it("sorts bars by value descending and assigns fills", () => {
    const bars = buildBarChart([
      { label: "Engineering", value: 12 },
      { label: "Sales", value: 30 },
      { label: "HR", value: 8 },
    ]);

    expect(bars.map((b) => b.label)).toEqual(["Sales", "Engineering", "HR"]);
    expect(bars[0]?.value).toBe(30);
    expect(bars.every((b) => b.fill.startsWith("var(--chart-"))).toBe(true);
  });
});

describe("formatGroupLabel", () => {
  it("maps null enum values to Unassigned", () => {
    expect(formatGroupLabel(null)).toBe("Unassigned");
  });

  it("formats snake_case status labels for display", () => {
    expect(formatGroupLabel("on_leave")).toBe("On leave");
    expect(formatGroupLabel("full_time")).toBe("Full-time");
  });

  it("passes through plain labels unchanged", () => {
    expect(formatGroupLabel("USA")).toBe("USA");
  });
});
