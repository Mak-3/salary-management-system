import { describe, expect, it } from "vitest";

import {
  buildCompensationSummary,
  mapCountrySalaryRows,
  mapDepartmentSalaryRanges,
  mapJobTitleCountryRows,
} from "./salary-stats";

describe("mapCountrySalaryRows", () => {
  it("maps groupBy aggregates to sorted country salary rows with currency", () => {
    const rows = mapCountrySalaryRows([
      {
        country: "India",
        _min: { salary: 400_000 },
        _max: { salary: 2_000_000 },
        _avg: { salary: 900_000 },
        _count: { _all: 5 },
      },
      {
        country: "USA",
        _min: { salary: 60_000 },
        _max: { salary: 200_000 },
        _avg: { salary: 120_000 },
        _count: { _all: 10 },
      },
    ]);

    expect(rows.map((r) => r.country)).toEqual(["India", "USA"]);
    expect(rows.find((r) => r.country === "USA")).toMatchObject({
      currency: "USD",
      min: 60_000,
      max: 200_000,
      avg: 120_000,
      count: 10,
    });
  });
});

describe("mapJobTitleCountryRows", () => {
  it("maps job title and country averages", () => {
    const rows = mapJobTitleCountryRows([
      {
        country: "USA",
        jobTitle: "Engineer",
        _avg: { salary: 130_000 },
        _count: { _all: 4 },
      },
      {
        country: "USA",
        jobTitle: "Manager",
        _avg: { salary: 150_000 },
        _count: { _all: 2 },
      },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      country: "USA",
      jobTitle: "Engineer",
      currency: "USD",
      avgSalary: 130_000,
      count: 4,
    });
  });

  it("sorts by country then job title", () => {
    const rows = mapJobTitleCountryRows([
      {
        country: "India",
        jobTitle: "Analyst",
        _avg: { salary: 500_000 },
        _count: { _all: 3 },
      },
      {
        country: "USA",
        jobTitle: "Analyst",
        _avg: { salary: 80_000 },
        _count: { _all: 3 },
      },
    ]);

    expect(rows[0]?.country).toBe("India");
    expect(rows[0]?.jobTitle).toBe("Analyst");
    expect(rows[1]?.country).toBe("USA");
    expect(rows[1]?.jobTitle).toBe("Analyst");
  });
});

describe("mapDepartmentSalaryRanges", () => {
  it("maps min, max, and avg per department", () => {
    const rows = mapDepartmentSalaryRanges(
      [
        {
          departmentId: "d1",
          _min: { salary: 50_000 },
          _max: { salary: 180_000 },
          _avg: { salary: 95_000 },
          _count: { _all: 6 },
        },
      ],
      new Map([["d1", "Engineering"]]),
    );

    expect(rows[0]).toEqual({
      department: "Engineering",
      min: 50_000,
      max: 180_000,
      avg: 95_000,
      spread: 130_000,
      count: 6,
    });
  });
});

describe("buildCompensationSummary", () => {
  it("builds workforce summary from counts and aggregate", () => {
    const summary = buildCompensationSummary({
      totalEmployees: 100,
      activeEmployees: 80,
      countryCount: 5,
      departmentCount: 8,
    });

    expect(summary).toEqual({
      totalEmployees: 100,
      activeEmployees: 80,
      activeRate: 80,
      countryCount: 5,
      departmentCount: 8,
    });
  });
});
