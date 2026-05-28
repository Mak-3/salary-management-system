import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    employee: {
      groupBy: vi.fn(),
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
  vi.mocked(prisma.department.findMany).mockResolvedValue(departments);
  vi.mocked(prisma.employee.groupBy).mockImplementation(async (args) => {
    const by = args.by as string[];

    if (by.includes("country")) {
      return [
        { country: "USA", _count: { _all: 10 } },
        { country: "India", _count: { _all: 5 } },
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

    expect(snapshot.byCountry.total).toBe(15);
    expect(snapshot.byCountry.segments[0]).toMatchObject({
      label: "USA",
      value: 10,
      percentage: 66.7,
    });

    expect(snapshot.byDepartment.map((item) => item.label)).toEqual([
      "Engineering",
      "Sales",
    ]);
    expect(snapshot.byDepartment[0]?.value).toBe(8);

    expect(snapshot.byStatus.segments[0]?.label).toBe("Active");
    expect(snapshot.byEmploymentType.segments[0]?.label).toBe("Full-time");

    expect(snapshot.avgSalaryByDepartment).toEqual([
      expect.objectContaining({ label: "Engineering", value: 120_000 }),
      expect.objectContaining({ label: "Sales", value: 90_000 }),
    ]);
  });
});
