"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  EmployeeEditDialog,
  EmployeeFormDialog,
} from "@/components/dashboard/employee-form-dialog";
import { EmploymentBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatJoinedAt, formatSalary } from "@/lib/employees/format";
import type {
  DepartmentOption,
  EmployeeRow,
  EmployeesListResponse,
} from "@/lib/employees/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const ALL = "__all__";

type Filters = {
  search: string;
  department: string;
  country: string;
  status: string;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  department: ALL,
  country: ALL,
  status: ALL,
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On leave" },
  { value: "terminated", label: "Terminated" },
];

type EmployeesTableProps = {
  departmentOptions: DepartmentOption[];
  countryOptions: string[];
};

export function EmployeesTable({
  departmentOptions,
  countryOptions,
}: EmployeesTableProps) {
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebounced(filters.search, 300);
  const [editTarget, setEditTarget] = React.useState<EmployeeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<EmployeeRow | null>(null);
  const [mutationError, setMutationError] = React.useState<string | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "fullName", desc: false },
  ]);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);

  React.useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch, filters.department, filters.country, filters.status, sorting, pageSize]);

  const sort = (sorting[0]?.id ?? "fullName") as "fullName" | "salary" | "joinedAt";
  const order: "asc" | "desc" = sorting[0]?.desc ? "desc" : "asc";

  const queryParams = {
    page: pageIndex + 1,
    pageSize,
    search: debouncedSearch,
    department: filters.department === ALL ? "" : filters.department,
    country: filters.country === ALL ? "" : filters.country,
    status: filters.status === ALL ? "" : filters.status,
    sort,
    order,
  };

  const query = useQuery<EmployeesListResponse>({
    queryKey: ["employees", queryParams],
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set("page", String(queryParams.page));
      search.set("pageSize", String(queryParams.pageSize));
      if (queryParams.search) search.set("search", queryParams.search);
      if (queryParams.department) search.set("department", queryParams.department);
      if (queryParams.country) search.set("country", queryParams.country);
      if (queryParams.status) search.set("status", queryParams.status);
      search.set("sort", queryParams.sort);
      search.set("order", queryParams.order);
      const response = await fetch(`/api/employees?${search.toString()}`);
      if (!response.ok) throw new Error("Failed to load employees");
      return (await response.json()) as EmployeesListResponse;
    },
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to delete employee");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      router.refresh();
      setDeleteTarget(null);
    },
    onError: (err: Error) => setMutationError(err.message),
  });

  const rows = query.data?.data ?? [];
  const total = query.data?.meta.total ?? 0;
  const pageCount = query.data?.meta.pageCount ?? 1;

  const columns = React.useMemo<ColumnDef<EmployeeRow>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Employee",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.fullName} />
            <div className="min-w-0">
              <div className="truncate font-medium text-foreground">
                {row.original.fullName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "jobTitle",
        header: "Title",
        enableSorting: false,
      },
      {
        accessorKey: "department",
        header: "Department",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {row.original.department}
          </Badge>
        ),
      },
      {
        accessorKey: "country",
        header: "Country",
        enableSorting: false,
      },
      {
        accessorKey: "salary",
        header: "Salary",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatSalary(row.original.salary, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "employmentType",
        header: "Type",
        enableSorting: false,
        cell: ({ row }) => <EmploymentBadge type={row.original.employmentType} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "joinedAt",
        header: "Joined",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatJoinedAt(row.original.joinedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setMutationError(null);
                setEditTarget(row.original);
              }}
              aria-label={`Edit ${row.original.fullName}`}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setMutationError(null);
                setDeleteTarget(row.original);
              }}
              aria-label={`Delete ${row.original.fullName}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    pageCount,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    manualSorting: true,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.department !== ALL ? 1 : 0) +
    (filters.country !== ALL ? 1 : 0) +
    (filters.status !== ALL ? 1 : 0);

  const showingFrom = total === 0 ? 0 : pageIndex * pageSize + 1;
  const showingTo = Math.min(total, (pageIndex + 1) * pageSize);
  const departmentNames = departmentOptions.map((d) => d.name);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <EmployeeFormDialog departmentOptions={departmentOptions} />

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Search by name, email, job title…"
            className="pl-8"
          />
        </div>

        <FilterSelect
          value={filters.department}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, department: value }))
          }
          placeholder="Department"
          options={departmentNames}
        />
        <FilterSelect
          value={filters.country}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, country: value }))
          }
          placeholder="Country"
          options={countryOptions}
        />
        <FilterSelect
          value={filters.status}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value }))
          }
          placeholder="Status"
          options={STATUS_OPTIONS}
        />

        {activeFilterCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            <X />
            Clear ({activeFilterCount})
          </Button>
        ) : null}

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          {query.isFetching && !query.isLoading ? (
            <Badge variant="outline" className="animate-pulse">
              Loading…
            </Badge>
          ) : null}
          <span>
            {total.toLocaleString()} employee{total === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30">
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-3 text-xs uppercase tracking-wide text-muted-foreground",
                        header.id === "actions" && "w-[88px]",
                      )}
                    >
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sortDir === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : sortDir === "desc" ? (
                            <ArrowDown className="size-3" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={`s-${i}`}>
                  {columns.map((_col, j) => (
                    <TableCell key={j} className="px-3 py-3">
                      <Skeleton className="h-4 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No employees match your filters.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(query.isFetching && "opacity-70")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-muted-foreground">
        <div>
          Showing <span className="text-foreground font-medium">{showingFrom}</span>–
          <span className="text-foreground font-medium">{showingTo}</span> of{" "}
          <span className="text-foreground font-medium">{total.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span>Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger size="sm" className="h-7 w-[72px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPageIndex(0)}
              disabled={pageIndex === 0}
            >
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
            >
              <ChevronLeft />
            </Button>
            <span className="px-2 text-foreground">
              Page {pageIndex + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPageIndex(pageCount - 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      <EmployeeEditDialog
        employee={editTarget}
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        departmentOptions={departmentOptions}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete employee</DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.fullName}
              </span>{" "}
              from the database. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {mutationError && deleteTarget ? (
            <p className="text-sm text-destructive" role="alert">
              {mutationError}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[] | { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 min-w-[140px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {placeholder.toLowerCase()}</SelectItem>
        {options.map((option) => {
          const isObject = typeof option === "object";
          const optionValue = isObject ? option.value : option;
          const optionLabel = isObject ? option.label : option;
          return (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = hashHue(name);
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: `hsl(${hue} 65% 45%)` }}
    >
      {initials}
    </span>
  );
}

function hashHue(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
