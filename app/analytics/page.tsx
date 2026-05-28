import { BarChart3 } from "lucide-react";

import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { AppNav } from "@/components/layout/app-nav";
import { getAnalytics } from "@/lib/analytics/queries";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Salary Management
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Salary benchmarks by country and role, plus workforce composition.
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <BarChart3 className="size-5" />
        </div>
      </header>

      <AppNav active="/analytics" />

      <AnalyticsDashboard data={data} />
    </main>
  );
}
