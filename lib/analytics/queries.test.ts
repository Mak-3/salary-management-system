import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    employee: {
      groupBy: vi.fn(),
      count: vi.fn(),
    },
    department: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

import { getAnalytics } from "./queries";

const departments = [
  { id: "dept-1", name: "Engineering" },
  { id: "dept-2", name: "Sales" },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.employee.count)
    .mockResolvedValueOnce(15)
    .mockResolvedValueOnce(12);
  vi.mocked(prisma.department.findMany).mockResolvedValue(departments);
  vi.mocked(prisma.employee.groupBy).mockImplementation(async (args) => {
    const by = args.by as string[];

    if (by.length === 2 && by.includes("country") && by.includes("jobTitle")) {
      return [
        {
          country: "USA",
          jobTitle: "Engineer",
          _avg: { salary: 130_000 },
          _count: { _all: 4 },
        },
        {
          country: "USA",
          jobTitle: "Manager",
          _avg: { salary: 160_000 },
          _count: { _all: 2 },
        },
      ] as never;
    }

    if (by.length === 1 && by[0] === "country" && "_min" in args) {
      return [
        {
          country: "USA",
          _min: { salary: 60_000 },
          _max: { salary: 200_000 },
          _avg: { salary: 120_000 },
          _count: { _all: 10 },
        },
        {
          country: "India",
          _min: { salary: 400_000 },
          _max: { salary: 2_000_000 },
          _avg: { salary: 900_000 },
          _count: { _all: 5 },
        },
      ] as never;
    }

    if (by.includes("country")) {
      return [
        { country: "USA", _count: { _all: 10 } },
        { country: "India", _count: { _all: 5 } },
      ] as never;
    }

    if (by.includes("departmentId") && "_min" in args) {
      return [
        {
          departmentId: "dept-1",
          _min: { salary: 70_000 },
          _max: { salary: 180_000 },
          _avg: { salary: 120_000 },
          _count: { _all: 8 },
        },
        {
          departmentId: "dept-2",
          _min: { salary: 50_000 },
          _max: { salary: 110_000 },
          _avg: { salary: 80_000 },
          _count: { _all: 7 },
        },
      ] as never;
    }

    if (by.includes("departmentId") && "_avg" in args) {
      return [
        {
          departmentId: "dept-1",
          _avg: { salary: 120_000 },
          _count: { _all: 8 },
        },
        {
          departmentId: "dept-2",
          _avg: { salary: 90_000 },
          _count: { _all: 7 },
        },
      ] as never;
    }

    if (by.includes("departmentId")) {
      return [
        { departmentId: "dept-1", _count: { _all: 8 } },
        { departmentId: "dept-2", _count: { _all: 7 } },
      ] as never;
    }

    if (by.includes("employmentType") && "_avg" in args) {
      return [
        { employmentType: "full_time", _avg: { salary: 110_000 }, _count: { _all: 11 } },
        { employmentType: "contract", _avg: { salary: 95_000 }, _count: { _all: 4 } },
      ] as never;
    }

    if (by.includes("status")) {
      return [
        { status: "active", _count: { _all: 12 } },
        { status: "on_leave", _count: { _all: 3 } },
      ] as never;
    }

    if (by.includes("employmentType")) {
      return [
        { employmentType: "full_time", _count: { _all: 11 } },
        { employmentType: "contract", _count: { _all: 4 } },
      ] as never;
    }

    return [] as never;
  });
});

describe("getAnalytics", () => {
  it("aggregates prisma groupBy results into an analytics snapshot", async () => {
    const snapshot = await getAnalytics();

    expect(snapshot.summary).toEqual({
      totalEmployees: 15,
      activeEmployees: 12,
      activeRate: 80,
      countryCount: 2,
      departmentCount: 2,
    });

    expect(snapshot.salaryByCountry.find((r) => r.country === "USA")).toMatchObject({
      currency: "USD",
      min: 60_000,
      max: 200_000,
      avg: 120_000,
      count: 10,
    });

    expect(snapshot.salaryByJobTitleCountry[0]).toMatchObject({
      country: "USA",
      jobTitle: "Engineer",
      avgSalary: 130_000,
    });

    expect(snapshot.salaryRangeByDepartment[0]).toMatchObject({
      department: "Engineering",
      spread: 110_000,
    });

    expect(snapshot.byCountry.total).toBe(15);
    expect(snapshot.byEmploymentType.segments[0]?.label).toBe("Full-time");
    expect(snapshot.avgSalaryByEmploymentType[0]?.label).toBe("Full-time");
  });
});
