import { AnalyticsBarChart } from "@/components/analytics/bar-chart";
import { ChartCard } from "@/components/analytics/chart-card";
import { CompensationSummaryCards } from "@/components/analytics/compensation-summary";
import { CountrySalaryTable } from "@/components/analytics/country-salary-table";
import { DepartmentSalaryRangeTable } from "@/components/analytics/department-salary-range-table";
import { JobTitleSalaryTable } from "@/components/analytics/job-title-salary-table";
import { DistributionPieChart } from "@/components/analytics/pie-chart";
import type { AnalyticsSnapshot } from "@/lib/analytics/types";

type AnalyticsDashboardProps = {
  data: AnalyticsSnapshot;
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const countries = data.salaryByCountry.map((row) => row.country);

  return (
    <div className="space-y-10">
      <CompensationSummaryCards summary={data.summary} />

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Compensation by country
          </h2>
          <p className="text-sm text-muted-foreground">
            Minimum, maximum, and average salary per country in local currency.
          </p>
        </div>
        <CountrySalaryTable rows={data.salaryByCountry} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Role benchmarks
          </h2>
          <p className="text-sm text-muted-foreground">
            Average salary for each job title within a country.
          </p>
        </div>
        <JobTitleSalaryTable
          rows={data.salaryByJobTitleCountry}
          countries={countries}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Pay equity insights
          </h2>
          <p className="text-sm text-muted-foreground">
            Salary spread within departments and employment types.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Salary range by department"
            description="Min, max, and spread — highlights internal pay gaps"
          >
            <DepartmentSalaryRangeTable rows={data.salaryRangeByDepartment} />
          </ChartCard>
          <ChartCard
            title="Average salary by employment type"
            description="Compare full-time, contract, and other arrangements"
          >
            <AnalyticsBarChart
              items={data.avgSalaryByEmploymentType}
              valueFormat="currency"
            />
          </ChartCard>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Workforce distribution
          </h2>
          <p className="text-sm text-muted-foreground">
            Headcount and composition across regions and teams.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Employees by country"
            description="Share of workforce across operating regions"
            className="lg:col-span-2"
          >
            <DistributionPieChart chart={data.byCountry} />
          </ChartCard>

          <ChartCard
            title="Headcount by department"
            description="Number of employees in each team"
          >
            <AnalyticsBarChart items={data.byDepartment} />
          </ChartCard>

          <ChartCard
            title="Average salary by department"
            description="Mean annual salary per team"
          >
            <AnalyticsBarChart
              items={data.avgSalaryByDepartment}
              valueFormat="currency"
            />
          </ChartCard>

          <ChartCard
            title="Employment status"
            description="Active, on leave, and other statuses"
          >
            <DistributionPieChart chart={data.byStatus} />
          </ChartCard>

          <ChartCard
            title="Employment type"
            description="Full-time, contract, intern, and other types"
          >
            <DistributionPieChart chart={data.byEmploymentType} />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}
