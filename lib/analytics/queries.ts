import { prisma } from "@/lib/prisma";

import {
  buildBarChart,
  buildDistributionChart,
  formatGroupLabel,
} from "./build-charts";
import {
  buildCompensationSummary,
  mapCountrySalaryRows,
  mapDepartmentSalaryRanges,
  mapJobTitleCountryRows,
} from "./salary-stats";
import type { AnalyticsSnapshot } from "./types";

export async function getAnalytics(): Promise<AnalyticsSnapshot> {
  const [
    totalEmployees,
    activeEmployees,
    countryGroups,
    countrySalaryGroups,
    jobTitleCountryGroups,
    departmentGroups,
    departmentSalaryGroups,
    statusGroups,
    employmentGroups,
    employmentSalaryGroups,
    salaryByDepartmentGroups,
    departments,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "active" } }),
    prisma.employee.groupBy({
      by: ["country"],
      _count: { _all: true },
      orderBy: { country: "asc" },
    }),
    prisma.employee.groupBy({
      by: ["country"],
      _min: { salary: true },
      _max: { salary: true },
      _avg: { salary: true },
      _count: { _all: true },
      orderBy: { country: "asc" },
    }),
    prisma.employee.groupBy({
      by: ["country", "jobTitle"],
      _avg: { salary: true },
      _count: { _all: true },
      orderBy: [{ country: "asc" }, { jobTitle: "asc" }],
    }),
    prisma.employee.groupBy({
      by: ["departmentId"],
      _count: { _all: true },
    }),
    prisma.employee.groupBy({
      by: ["departmentId"],
      _min: { salary: true },
      _max: { salary: true },
      _avg: { salary: true },
      _count: { _all: true },
    }),
    prisma.employee.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.employee.groupBy({
      by: ["employmentType"],
      _count: { _all: true },
    }),
    prisma.employee.groupBy({
      by: ["employmentType"],
      _avg: { salary: true },
      _count: { _all: true },
    }),
    prisma.employee.groupBy({
      by: ["departmentId"],
      _avg: { salary: true },
      _count: { _all: true },
    }),
    prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const departmentNames = new Map(
    departments.map((department) => [department.id, department.name]),
  );

  const departmentLabel = (departmentId: string) =>
    departmentNames.get(departmentId) ?? "Unknown";

  const salaryByCountry = mapCountrySalaryRows(countrySalaryGroups);

  return {
    summary: buildCompensationSummary({
      totalEmployees,
      activeEmployees,
      countryCount: countryGroups.length,
      departmentCount: departments.length,
    }),
    salaryByCountry,
    salaryByJobTitleCountry: mapJobTitleCountryRows(jobTitleCountryGroups),
    salaryRangeByDepartment: mapDepartmentSalaryRanges(
      departmentSalaryGroups,
      departmentNames,
    ),
    byCountry: buildDistributionChart(
      countryGroups.map((group) => ({
        label: group.country,
        count: group._count._all,
      })),
    ),
    byDepartment: buildBarChart(
      departmentGroups.map((group) => ({
        label: departmentLabel(group.departmentId),
        value: group._count._all,
      })),
    ),
    byStatus: buildDistributionChart(
      statusGroups.map((group) => ({
        label: formatGroupLabel(group.status),
        count: group._count._all,
      })),
    ),
    byEmploymentType: buildDistributionChart(
      employmentGroups.map((group) => ({
        label: formatGroupLabel(group.employmentType),
        count: group._count._all,
      })),
    ),
    avgSalaryByDepartment: buildBarChart(
      salaryByDepartmentGroups
        .filter((group) => group._avg.salary !== null)
        .map((group) => ({
          label: departmentLabel(group.departmentId),
          value: Math.round(Number(group._avg.salary)),
        })),
    ),
    avgSalaryByEmploymentType: buildBarChart(
      employmentSalaryGroups
        .filter((group) => group._avg.salary !== null)
        .map((group) => ({
          label: formatGroupLabel(group.employmentType),
          value: Math.round(Number(group._avg.salary)),
        })),
    ),
  };
}
