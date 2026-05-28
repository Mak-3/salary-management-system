import type { EmployeeStatus, EmploymentType } from "@/prisma/seed/data/employee-enums";

export type EmployeeRow = {
  id: string;
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

export type EmployeesListMeta = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type EmployeesListResponse = {
  data: EmployeeRow[];
  meta: EmployeesListMeta;
};

export type EmployeesQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  country?: string;
  status?: string;
  employmentType?: string;
  sort?: "fullName" | "salary" | "joinedAt";
  order?: "asc" | "desc";
};

export type DepartmentOption = {
  id: string;
  name: string;
};

export type DashboardStats = {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  countries: number;
  departmentOptions: DepartmentOption[];
  countryOptions: string[];
};
