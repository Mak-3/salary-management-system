import { countryCurrency, type Country } from "@/prisma/seed/data/countries";

import type {
  CompensationSummary,
  CountrySalaryRow,
  DepartmentSalaryRange,
  JobTitleCountrySalaryRow,
} from "./types";

type SalaryAggregate = {
  _min: { salary: unknown };
  _max: { salary: unknown };
  _avg: { salary: unknown };
  _count: { _all: number };
};

export function mapCountrySalaryRows(
  groups: Array<{ country: string } & SalaryAggregate>,
): CountrySalaryRow[] {
  return groups
    .map((group) => ({
      country: group.country,
      currency: currencyForCountry(group.country),
      min: roundSalary(group._min.salary),
      max: roundSalary(group._max.salary),
      avg: roundSalary(group._avg.salary),
      count: group._count._all,
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
}

export function mapJobTitleCountryRows(
  groups: Array<{ country: string; jobTitle: string; _avg: { salary: unknown }; _count: { _all: number } }>,
): JobTitleCountrySalaryRow[] {
  return groups
    .map((group) => ({
      country: group.country,
      jobTitle: group.jobTitle,
      currency: currencyForCountry(group.country),
      avgSalary: roundSalary(group._avg.salary),
      count: group._count._all,
    }))
    .sort((a, b) => {
      const byCountry = a.country.localeCompare(b.country);
      if (byCountry !== 0) return byCountry;
      return a.jobTitle.localeCompare(b.jobTitle);
    });
}

export function mapDepartmentSalaryRanges(
  groups: Array<{ departmentId: string } & SalaryAggregate>,
  departmentNames: Map<string, string>,
): DepartmentSalaryRange[] {
  return groups
    .map((group) => {
      const min = roundSalary(group._min.salary);
      const max = roundSalary(group._max.salary);
      const avg = roundSalary(group._avg.salary);
      return {
        department: departmentNames.get(group.departmentId) ?? "Unknown",
        min,
        max,
        avg,
        spread: max - min,
        count: group._count._all,
      };
    })
    .sort((a, b) => b.spread - a.spread);
}

export function buildCompensationSummary(input: {
  totalEmployees: number;
  activeEmployees: number;
  countryCount: number;
  departmentCount: number;
}): CompensationSummary {
  const { totalEmployees, activeEmployees, countryCount, departmentCount } = input;
  return {
    totalEmployees,
    activeEmployees,
    activeRate:
      totalEmployees === 0
        ? 0
        : Math.round((activeEmployees / totalEmployees) * 1000) / 10,
    countryCount,
    departmentCount,
  };
}

function currencyForCountry(country: string): string {
  return countryCurrency[country as Country] ?? "USD";
}

function roundSalary(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num);
}
