export type ChartSegment = {
  label: string;
  value: number;
  percentage: number;
  fill: string;
};

export type DistributionChart = {
  total: number;
  segments: ChartSegment[];
};

export type BarChartItem = {
  label: string;
  value: number;
  fill: string;
};

export type CompensationSummary = {
  totalEmployees: number;
  activeEmployees: number;
  activeRate: number;
  countryCount: number;
  departmentCount: number;
};

export type CountrySalaryRow = {
  country: string;
  currency: string;
  min: number;
  max: number;
  avg: number;
  count: number;
};

export type JobTitleCountrySalaryRow = {
  country: string;
  jobTitle: string;
  currency: string;
  avgSalary: number;
  count: number;
};

export type DepartmentSalaryRange = {
  department: string;
  min: number;
  max: number;
  avg: number;
  spread: number;
  count: number;
};

export type AnalyticsSnapshot = {
  summary: CompensationSummary;
  salaryByCountry: CountrySalaryRow[];
  salaryByJobTitleCountry: JobTitleCountrySalaryRow[];
  salaryRangeByDepartment: DepartmentSalaryRange[];
  byCountry: DistributionChart;
  byDepartment: BarChartItem[];
  byStatus: DistributionChart;
  byEmploymentType: DistributionChart;
  avgSalaryByDepartment: BarChartItem[];
  avgSalaryByEmploymentType: BarChartItem[];
};
