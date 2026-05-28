import { Badge } from "@/components/ui/badge";
import type { EmployeeStatus, EmploymentType } from "@/prisma/seed/data/employee-enums";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<EmployeeStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  inactive: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
  on_leave: "bg-amber-500/10 text-amber-700 dark:text-amber-500",
  terminated: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const STATUS_LABEL: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On leave",
  terminated: "Terminated",
};

export function StatusBadge({ status }: { status: EmployeeStatus | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="outline" className={cn("border-transparent", STATUS_STYLES[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

const TYPE_LABEL: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export function EmploymentBadge({ type }: { type: EmploymentType | null }) {
  if (!type) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="secondary" className="font-normal">
      {TYPE_LABEL[type]}
    </Badge>
  );
}
