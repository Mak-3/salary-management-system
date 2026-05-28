import {
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  type EmployeeStatus,
  type EmploymentType,
} from "@/prisma/seed/data/employee-enums";
import { COUNTRIES } from "@/prisma/seed/data/countries";

export type EmployeePayload = {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  employmentType: EmploymentType | null;
  status: EmployeeStatus | null;
  joinedAt: string | null;
};

type ParseResult =
  | { ok: true; data: EmployeePayload }
  | { ok: false; error: string };

export function parseEmployeePayload(body: unknown): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid request body" };
  }

  const record = body as Record<string, unknown>;

  const fullName = trimString(record.fullName);
  const email = trimString(record.email);
  const jobTitle = trimString(record.jobTitle);
  const department = trimString(record.department);
  const country = trimString(record.country);
  const currency = trimString(record.currency)?.toUpperCase() ?? "";

  if (!fullName) return { ok: false, error: "Full name is required" };
  if (!email) return { ok: false, error: "Email is required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Invalid email address" };
  }
  if (!jobTitle) return { ok: false, error: "Job title is required" };
  if (!department) return { ok: false, error: "Department is required" };
  if (!country) return { ok: false, error: "Country is required" };
  if (!COUNTRIES.includes(country as (typeof COUNTRIES)[number])) {
    return { ok: false, error: "Invalid country" };
  }
  if (!currency || currency.length !== 3) {
    return { ok: false, error: "Currency must be a 3-letter code" };
  }

  const salary = parseSalary(record.salary);
  if (salary === null) return { ok: false, error: "Salary must be a positive number" };

  const employmentType = parseEnum(
    record.employmentType,
    EMPLOYMENT_TYPES,
    true,
  ) as EmploymentType | null;
  if (employmentType === undefined) {
    return { ok: false, error: "Invalid employment type" };
  }

  const status = parseEnum(record.status, EMPLOYEE_STATUSES, true) as
    | EmployeeStatus
    | null;
  if (status === undefined) {
    return { ok: false, error: "Invalid status" };
  }

  const joinedAt = parseJoinedAt(record.joinedAt);

  return {
    ok: true,
    data: {
      fullName,
      email,
      jobTitle,
      department,
      country,
      currency,
      salary,
      employmentType,
      status,
      joinedAt,
    },
  };
}

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseSalary(value: unknown): number | null {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

function parseEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  allowNull: boolean,
): T | null | undefined {
  if (value === null || value === "") {
    return allowNull ? null : undefined;
  }
  if (typeof value !== "string") return undefined;
  return allowed.includes(value as T) ? (value as T) : undefined;
}

function parseJoinedAt(value: unknown): string | null {
  if (value === null || value === "" || value === undefined) return null;
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
