import { countryCurrency, COUNTRIES } from "@/prisma/seed/data/countries";
import {
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
} from "@/prisma/seed/data/employee-enums";

import type { EmployeeRow } from "./types";

export type EmployeeFormValues = {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salary: string;
  employmentType: string;
  status: string;
  joinedAt: string;
};

export const COUNTRY_OPTIONS = [...COUNTRIES];

export const EMPLOYMENT_TYPE_OPTIONS = EMPLOYMENT_TYPES.map((value) => ({
  value,
  label: formatEmploymentType(value),
}));

export const STATUS_FORM_OPTIONS = EMPLOYEE_STATUSES.map((value) => ({
  value,
  label: formatStatus(value),
}));

export const EMPTY_EMPLOYEE_FORM: EmployeeFormValues = {
  fullName: "",
  email: "",
  jobTitle: "",
  department: "",
  country: COUNTRY_OPTIONS[0] ?? "",
  currency: countryCurrency[COUNTRY_OPTIONS[0] as keyof typeof countryCurrency] ?? "USD",
  salary: "",
  employmentType: "full_time",
  status: "active",
  joinedAt: new Date().toISOString().slice(0, 10),
};

export function employeeToFormValues(employee: EmployeeRow): EmployeeFormValues {
  return {
    fullName: employee.fullName,
    email: employee.email,
    jobTitle: employee.jobTitle,
    department: employee.department,
    country: employee.country,
    currency: employee.currency,
    salary: String(employee.salary),
    employmentType: employee.employmentType ?? "",
    status: employee.status ?? "",
    joinedAt: employee.joinedAt ? employee.joinedAt.slice(0, 10) : "",
  };
}

export function formValuesToPayload(values: EmployeeFormValues) {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    jobTitle: values.jobTitle.trim(),
    department: values.department,
    country: values.country,
    currency: values.currency,
    salary: Number(values.salary),
    employmentType: values.employmentType || null,
    status: values.status || null,
    joinedAt: values.joinedAt || null,
  };
}

export function currencyForCountry(country: string): string {
  return countryCurrency[country as keyof typeof countryCurrency] ?? "USD";
}

function formatEmploymentType(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatStatus(value: string): string {
  if (value === "on_leave") return "On leave";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
