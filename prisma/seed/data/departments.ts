export const DEPARTMENT_NAMES = [
  "Engineering",
  "Product",
  "Finance",
  "Design",
  "HR",
  "Support",
] as const;

export type DepartmentName = (typeof DEPARTMENT_NAMES)[number];

/** [minFactor, maxFactor] applied to country base salary. */
export const departmentSalaryFactor: Record<
  DepartmentName,
  [number, number]
> = {
  Engineering: [1.2, 1.6],
  Product: [1.1, 1.4],
  Finance: [1.0, 1.3],
  Design: [0.8, 1.1],
  HR: [0.7, 1.0],
  Support: [0.6, 0.9],
};

export const departmentJobTitles: Record<DepartmentName, readonly string[]> = {
  Engineering: [
    "Software Engineer",
    "Senior Software Engineer",
    "Tech Lead",
    "Staff Engineer",
    "DevOps Engineer",
    "QA Engineer",
  ],
  Product: [
    "Product Manager",
    "Associate Product Manager",
    "Product Owner",
    "Program Manager",
    "Product Analyst",
  ],
  Finance: [
    "Financial Analyst",
    "Accountant",
    "Controller",
    "FP&A Manager",
    "Payroll Specialist",
  ],
  Design: [
    "UX Designer",
    "UI Designer",
    "Product Designer",
    "Design Lead",
    "Visual Designer",
  ],
  HR: [
    "HR Manager",
    "Recruiter",
    "People Operations Specialist",
    "HR Business Partner",
    "Talent Acquisition Lead",
  ],
  Support: [
    "Customer Support Specialist",
    "Support Engineer",
    "Technical Support Lead",
    "Client Success Manager",
    "Help Desk Analyst",
  ],
};
