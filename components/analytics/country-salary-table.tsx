import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSalary } from "@/lib/employees/format";
import type { CountrySalaryRow } from "@/lib/analytics/types";

type CountrySalaryTableProps = {
  rows: CountrySalaryRow[];
};

export function CountrySalaryTable({ rows }: CountrySalaryTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No salary data available.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Country</TableHead>
            <TableHead className="text-right">Employees</TableHead>
            <TableHead className="text-right">Minimum</TableHead>
            <TableHead className="text-right">Average</TableHead>
            <TableHead className="text-right">Maximum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.country}>
              <TableCell className="font-medium">{row.country}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {row.count.toLocaleString()}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatSalary(row.min, row.currency)}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatSalary(row.avg, row.currency)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatSalary(row.max, row.currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
