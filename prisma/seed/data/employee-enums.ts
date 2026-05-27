export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "intern",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYEE_STATUSES = [
  "active",
  "inactive",
  "on_leave",
  "terminated",
] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];
