"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSalary } from "@/lib/employees/format";
import type { JobTitleCountrySalaryRow } from "@/lib/analytics/types";

const ALL = "__all__";

type JobTitleSalaryTableProps = {
  rows: JobTitleCountrySalaryRow[];
  countries: string[];
};

export function JobTitleSalaryTable({ rows, countries }: JobTitleSalaryTableProps) {
  const [country, setCountry] = React.useState(ALL);

  const filtered =
    country === ALL ? rows : rows.filter((row) => row.country === country);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Average pay for each role within a country (local currency).
        </p>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue placeholder="Filter by country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="max-h-[360px] overflow-auto rounded-lg ring-1 ring-foreground/10">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="bg-muted/30">
              <TableHead>Country</TableHead>
              <TableHead>Job title</TableHead>
              <TableHead className="text-right">Employees</TableHead>
              <TableHead className="text-right">Avg salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No roles for this country.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={`${row.country}-${row.jobTitle}`}>
                  <TableCell className="font-medium">{row.country}</TableCell>
                  <TableCell>{row.jobTitle}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {row.count.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatSalary(row.avgSalary, row.currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
