import type { Prisma } from "@prisma/client";
import { Prisma as PrismaNamespace } from "@prisma/client";

import { countryCurrency, type Country } from "@/prisma/seed/data/countries";
import { prisma } from "@/lib/prisma";

import type { EmployeeRow } from "./types";
import type { EmployeePayload } from "./validation";

export class EmployeeNotFoundError extends Error {
  constructor() {
    super("Employee not found");
    this.name = "EmployeeNotFoundError";
  }
}

export class EmployeeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmployeeValidationError";
  }
}

const employeeInclude = {
  department: { select: { name: true } },
} satisfies Prisma.EmployeeInclude;

type EmployeeWithDepartment = Prisma.EmployeeGetPayload<{
  include: typeof employeeInclude;
}>;

export async function createEmployee(
  payload: EmployeePayload,
): Promise<EmployeeRow> {
  const departmentId = await resolveDepartmentId(payload.department);
  const currency =
    payload.currency || currencyForCountry(payload.country as Country);

  try {
    const created = await prisma.employee.create({
      data: {
        fullName: payload.fullName,
        email: payload.email.toLowerCase(),
        jobTitle: payload.jobTitle,
        departmentId,
        country: payload.country,
        currency,
        salary: payload.salary,
        employmentType: payload.employmentType ?? undefined,
        status: payload.status ?? undefined,
        joinedAt: payload.joinedAt ? new Date(payload.joinedAt) : undefined,
      },
      include: employeeInclude,
    });
    return mapEmployeeRow(created);
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function updateEmployee(
  id: string,
  payload: EmployeePayload,
): Promise<EmployeeRow> {
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) throw new EmployeeNotFoundError();

  const departmentId = await resolveDepartmentId(payload.department);
  const currency =
    payload.currency || currencyForCountry(payload.country as Country);

  try {
    const updated = await prisma.employee.update({
      where: { id },
      data: {
        fullName: payload.fullName,
        email: payload.email.toLowerCase(),
        jobTitle: payload.jobTitle,
        departmentId,
        country: payload.country,
        currency,
        salary: payload.salary,
        employmentType: payload.employmentType,
        status: payload.status,
        joinedAt: payload.joinedAt ? new Date(payload.joinedAt) : null,
      },
      include: employeeInclude,
    });
    return mapEmployeeRow(updated);
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  try {
    await prisma.employee.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof PrismaNamespace.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new EmployeeNotFoundError();
    }
    throw error;
  }
}

async function resolveDepartmentId(name: string): Promise<string> {
  const department = await prisma.department.findFirst({
    where: { name },
    select: { id: true },
  });
  if (!department) {
    throw new EmployeeValidationError(`Department "${name}" not found`);
  }
  return department.id;
}

function currencyForCountry(country: Country): string {
  return countryCurrency[country] ?? "USD";
}

function mapEmployeeRow(row: EmployeeWithDepartment): EmployeeRow {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    jobTitle: row.jobTitle,
    department: row.department.name,
    country: row.country,
    currency: row.currency,
    salary: Number(row.salary),
    employmentType: row.employmentType,
    status: row.status,
    joinedAt: row.joinedAt ? row.joinedAt.toISOString() : null,
  };
}

function mapPrismaError(error: unknown): Error {
  if (
    error instanceof PrismaNamespace.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return new EmployeeValidationError("An employee with this email already exists");
  }
  if (error instanceof Error) return error;
  return new Error("Database error");
}
