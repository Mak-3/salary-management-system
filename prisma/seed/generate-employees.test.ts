import { describe, expect, it } from "vitest";

import { countryCurrency } from "./data/countries";
import { departmentJobTitles } from "./data/departments";
import {
  FIRST_NAME_COUNT,
  LAST_NAME_COUNT,
  firstNames,
  lastNames,
} from "./data/names";
import { computeSalary, generateEmployees } from "./generate-employees";

const EXPECTED_EMPLOYEE_COUNT = FIRST_NAME_COUNT * LAST_NAME_COUNT;

describe("computeSalary", () => {
  it("is deterministic for the same inputs", () => {
    const a = computeSalary("USA", "Engineering", 12345);
    const b = computeSalary("USA", "Engineering", 12345);
    expect(a).toBe(b);
  });

  it("returns a non-negative integer", () => {
    const salary = computeSalary("India", "HR", 99);
    expect(salary).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(salary)).toBe(true);
  });

  it("Engineering pays more than Support for the same country and seed", () => {
    const seed = 42_000;
    const engineering = computeSalary("USA", "Engineering", seed);
    const support = computeSalary("USA", "Support", seed);
    expect(engineering).toBeGreaterThan(support);
  });

  it("stays within country base × department factor bounds", () => {
    const salary = computeSalary("Canada", "Finance", 7_001);
    // min: 55_000 × 1.0, max: 150_000 × 1.3
    expect(salary).toBeGreaterThanOrEqual(55_000);
    expect(salary).toBeLessThanOrEqual(195_000);
  });
});

describe("generateEmployees", () => {
  const employees = generateEmployees();

  it(`produces ${EXPECTED_EMPLOYEE_COUNT} employees`, () => {
    expect(employees).toHaveLength(EXPECTED_EMPLOYEE_COUNT);
  });

  it("has unique emails and full names", () => {
    const emails = new Set(employees.map((e) => e.email));
    const fullNames = new Set(employees.map((e) => e.fullName));
    expect(emails.size).toBe(EXPECTED_EMPLOYEE_COUNT);
    expect(fullNames.size).toBe(EXPECTED_EMPLOYEE_COUNT);
  });

  it("builds full names from the name lists", () => {
    expect(employees[0]!.fullName).toBe(`${firstNames[0]} ${lastNames[0]}`);
    const lastIndex =
      (firstNames.length - 1) * lastNames.length + (lastNames.length - 1);
    expect(employees[lastIndex]!.fullName).toBe(
      `${firstNames.at(-1)} ${lastNames.at(-1)}`,
    );
  });

  it("uses the correct currency per country", () => {
    for (const employee of employees) {
      expect(employee.currency).toBe(countryCurrency[employee.country]);
    }
  });

  it("assigns job titles from the employee department", () => {
    for (const employee of employees) {
      const titles = departmentJobTitles[employee.departmentName];
      expect(titles).toContain(employee.jobTitle);
    }
  });

  it("uses deterministic seed emails", () => {
    expect(employees[0]!.email).toMatch(
      /^[a-z0-9.]+\.[a-z0-9.]+\.0\.0@seed\.salary-mgmt\.local$/,
    );
  });

  it("is reproducible across calls", () => {
    const secondRun = generateEmployees();
    expect(secondRun[0]).toEqual(employees[0]);
    expect(secondRun.at(-1)).toEqual(employees.at(-1));
  });
});
