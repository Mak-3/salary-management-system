import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DepartmentSalaryRange } from "@/lib/analytics/types";

type DepartmentSalaryRangeTableProps = {
  rows: DepartmentSalaryRange[];
};

export function DepartmentSalaryRangeTable({ rows }: DepartmentSalaryRangeTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No department salary data available.
      </p>
    );
  }

  const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Department</TableHead>
            <TableHead className="text-right">Employees</TableHead>
            <TableHead className="text-right">Min</TableHead>
            <TableHead className="text-right">Avg</TableHead>
            <TableHead className="text-right">Max</TableHead>
            <TableHead className="text-right">Spread</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.department}>
              <TableCell className="font-medium">{row.department}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {row.count.toLocaleString()}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatter.format(row.min)}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatter.format(row.avg)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatter.format(row.max)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-amber-600 dark:text-amber-400">
                {formatter.format(row.spread)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
