import { Building2, Globe2, UserCheck, Users } from "lucide-react";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmployeesTable } from "@/components/dashboard/employees-table";
import { getDashboardStats } from "@/lib/employees/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const numberFormatter = new Intl.NumberFormat("en-US");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Salary Management
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Global overview of your workforce across departments and regions.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total employees"
          value={numberFormatter.format(stats.totalEmployees)}
          hint="All records in database"
          icon={Users}
          accent="blue"
        />
        <KpiCard
          label="Active"
          value={numberFormatter.format(stats.activeEmployees)}
          hint={`${percentage(stats.activeEmployees, stats.totalEmployees)} of workforce`}
          icon={UserCheck}
          accent="emerald"
        />
        <KpiCard
          label="Departments"
          value={stats.departments}
          hint="Distinct teams"
          icon={Building2}
          accent="violet"
        />
        <KpiCard
          label="Countries"
          value={stats.countries}
          hint="Where employees are based"
          icon={Globe2}
          accent="amber"
        />
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Employees
          </h2>
          <p className="text-sm text-muted-foreground">
            Add, edit, or delete records. Sort, search, and filter across the dataset.
          </p>
        </div>
        <EmployeesTable
          departmentOptions={stats.departmentOptions}
          countryOptions={stats.countryOptions}
        />
      </section>
    </main>
  );
}

function percentage(part: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}
