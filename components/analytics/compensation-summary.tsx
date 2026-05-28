import { Building2, Globe2, UserCheck, Users } from "lucide-react";

import { KpiCard } from "@/components/dashboard/kpi-card";
import type { CompensationSummary } from "@/lib/analytics/types";

type CompensationSummaryProps = {
  summary: CompensationSummary;
};

export function CompensationSummaryCards({ summary }: CompensationSummaryProps) {
  const numberFormatter = new Intl.NumberFormat("en-US");

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total employees"
        value={numberFormatter.format(summary.totalEmployees)}
        hint="Workforce size"
        icon={Users}
        accent="blue"
      />
      <KpiCard
        label="Active employees"
        value={numberFormatter.format(summary.activeEmployees)}
        hint={`${summary.activeRate}% of workforce`}
        icon={UserCheck}
        accent="emerald"
      />
      <KpiCard
        label="Countries"
        value={summary.countryCount}
        hint="Operating regions"
        icon={Globe2}
        accent="amber"
      />
      <KpiCard
        label="Departments"
        value={summary.departmentCount}
        hint="Distinct teams"
        icon={Building2}
        accent="violet"
      />
    </section>
  );
}
