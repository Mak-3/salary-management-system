import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "blue" | "emerald" | "violet" | "amber";
};

const ACCENT: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function KpiCard({ label, value, hint, icon: Icon, accent = "blue" }: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-heading text-3xl font-semibold tracking-tight">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <p className="text-xs text-muted-foreground">{hint}</p>
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            ACCENT[accent],
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
