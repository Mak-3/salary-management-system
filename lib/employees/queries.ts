import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  DashboardStats,
  EmployeesListResponse,
  EmployeesQueryParams,
} from "./types";

const ALLOWED_SORT = new Set(["fullName", "salary", "joinedAt"]);

export async function listEmployees(
  params: EmployeesQueryParams,
): Promise<EmployeesListResponse> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

  const where: Prisma.EmployeeWhereInput = {};

  if (params.search?.trim()) {
    const q = params.search.trim();
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { jobTitle: { contains: q, mode: "insensitive" } },
    ];
  }
  if (params.department) where.department = { name: params.department };
  if (params.country) where.country = params.country;
  if (params.status) {
    where.status = params.status as Prisma.EmployeeWhereInput["status"];
  }
  if (params.employmentType) {
    where.employmentType =
      params.employmentType as Prisma.EmployeeWhereInput["employmentType"];
  }

  const sortKey =
    params.sort && ALLOWED_SORT.has(params.sort) ? params.sort : "fullName";
  const order: Prisma.SortOrder = params.order === "desc" ? "desc" : "asc";
  const orderBy: Prisma.EmployeeOrderByWithRelationInput = { [sortKey]: order };

  const [total, rows] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { department: { select: { name: true } } },
    }),
  ]);

  return {
    data: rows.map((row) => ({
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
    })),
    meta: {
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalEmployees,
    activeEmployees,
    departments,
    countries,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "active" } }),
    prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    }),
  ]);

  return {
    totalEmployees,
    activeEmployees,
    departments: departments.length,
    countries: countries.length,
    departmentOptions: departments,
    countryOptions: countries.map((c) => c.country),
  };
}
