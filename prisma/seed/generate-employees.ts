import {
  COUNTRIES,
  countryCurrency,
  countrySalaryRanges,
  type Country,
} from "./data/countries";
import {
  DEPARTMENT_NAMES,
  departmentJobTitles,
  departmentSalaryFactor,
  type DepartmentName,
} from "./data/departments";
import {
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  type EmployeeStatus,
  type EmploymentType,
} from "./data/employee-enums";
import { firstNames, lastNames } from "./data/names";
import {
  employeeSeed,
  pickOne,
  randomBetween,
  randomFloat,
  slugify,
} from "./utils";

export type EmployeeSeedRow = {
  fullName: string;
  email: string;
  jobTitle: string;
  departmentName: DepartmentName;
  country: Country;
  currency: string;
  salary: number;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joinedAt: Date;
};

export function computeSalary(
  country: Country,
  department: DepartmentName,
  seed: number,
): number {
  const [min, max] = countrySalaryRanges[country];
  const baseSalary = randomBetween(min, max, seed);

  const [factorMin, factorMax] = departmentSalaryFactor[department];
  const factor = randomFloat(factorMin, factorMax, seed + 1);

  return Math.round(baseSalary * factor);
}

export function generateEmployees(): EmployeeSeedRow[] {
  const employees: EmployeeSeedRow[] = [];

  for (let fi = 0; fi < firstNames.length; fi++) {
    const firstName = firstNames[fi]!;
    for (let li = 0; li < lastNames.length; li++) {
      const lastName = lastNames[li]!;
      const fullName = `${firstName} ${lastName}`;

      const linearIndex = fi * lastNames.length + li;
      const departmentName =
        DEPARTMENT_NAMES[linearIndex % DEPARTMENT_NAMES.length]!;
      const country = COUNTRIES[linearIndex % COUNTRIES.length]!;
      const seed = employeeSeed(fi, li);

      const jobTitle = pickOne(
        departmentJobTitles[departmentName],
        seed + 2,
      );
      const salary = computeSalary(country, departmentName, seed);
      const employmentType =
        EMPLOYMENT_TYPES[seed % EMPLOYMENT_TYPES.length]!;
      const status = EMPLOYEE_STATUSES[seed % EMPLOYEE_STATUSES.length]!;

      const joinedAt = new Date("2017-01-01");
      joinedAt.setDate(joinedAt.getDate() + (linearIndex % (8 * 365)));

      employees.push({
        fullName,
        email: `${slugify(firstName)}.${slugify(lastName)}.${fi}.${li}@seed.salary-mgmt.local`,
        jobTitle,
        departmentName,
        country,
        currency: countryCurrency[country],
        salary,
        employmentType,
        status,
        joinedAt,
      });
    }
  }

  return employees;
}
