"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

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
import {
  COUNTRY_OPTIONS,
  EMPTY_EMPLOYEE_FORM,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_FORM_OPTIONS,
  currencyForCountry,
  employeeToFormValues,
  formValuesToPayload,
  type EmployeeFormValues,
} from "@/lib/employees/form";
import type { DepartmentOption, EmployeeRow } from "@/lib/employees/types";

type EmployeeFormDialogProps = {
  departmentOptions: DepartmentOption[];
  defaultDepartment?: string;
};

export function EmployeeFormDialog({
  departmentOptions,
  defaultDepartment,
}: EmployeeFormDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus />
        Add employee
      </Button>

      <EmployeeFormDialogContent
        open={open}
        onOpenChange={setOpen}
        mode="create"
        departmentOptions={departmentOptions}
        defaultDepartment={defaultDepartment}
      />
    </>
  );
}

type EmployeeEditDialogProps = {
  employee: EmployeeRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentOptions: DepartmentOption[];
};

export function EmployeeEditDialog({
  employee,
  open,
  onOpenChange,
  departmentOptions,
}: EmployeeEditDialogProps) {
  return (
    <EmployeeFormDialogContent
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      employee={employee ?? undefined}
      departmentOptions={departmentOptions}
    />
  );
}

type EmployeeFormDialogContentProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  employee?: EmployeeRow;
  departmentOptions: DepartmentOption[];
  defaultDepartment?: string;
};

function EmployeeFormDialogContent({
  open,
  onOpenChange,
  mode,
  employee,
  departmentOptions,
  defaultDepartment,
}: EmployeeFormDialogContentProps) {
  const [values, setValues] = React.useState<EmployeeFormValues>(EMPTY_EMPLOYEE_FORM);
  const [error, setError] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const isEdit = mode === "edit";

  const resetForm = React.useCallback(() => {
    if (isEdit && employee) {
      setValues(employeeToFormValues(employee));
    } else {
      const department =
        defaultDepartment ?? departmentOptions[0]?.name ?? "";
      setValues({
        ...EMPTY_EMPLOYEE_FORM,
        department,
        country: COUNTRY_OPTIONS[0] ?? "",
        currency: currencyForCountry(COUNTRY_OPTIONS[0] ?? ""),
      });
    }
    setError(null);
  }, [isEdit, employee, defaultDepartment, departmentOptions]);

  React.useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  const mutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof formValuesToPayload>) => {
      const url = isEdit && employee ? `/api/employees/${employee.id}` : "/api/employees";
      const method = isEdit ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as EmployeeRow | { error?: string };
      if (!response.ok) {
        throw new Error(
          "error" in body ? body.error : `Failed to ${isEdit ? "update" : "create"} employee`,
        );
      }
      return body as EmployeeRow;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      router.refresh();
      onOpenChange(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  function updateField<K extends keyof EmployeeFormValues>(
    key: K,
    value: EmployeeFormValues[K],
  ) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "country" && typeof value === "string") {
        next.currency = currencyForCountry(value);
      }
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    mutation.mutate(formValuesToPayload(values));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit employee" : "Add employee"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? `Update details for ${employee?.fullName ?? "this employee"}.`
                : "Create a new employee record."}
            </DialogDescription>
          </DialogHeader>

          <EmployeeFormFields
            values={values}
            onChange={updateField}
            departmentOptions={departmentOptions}
          />

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create employee"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type EmployeeFormFieldsProps = {
  values: EmployeeFormValues;
  onChange: <K extends keyof EmployeeFormValues>(
    key: K,
    value: EmployeeFormValues[K],
  ) => void;
  departmentOptions: DepartmentOption[];
};

function EmployeeFormFields({
  values,
  onChange,
  departmentOptions,
}: EmployeeFormFieldsProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <FormField label="Full name" className="sm:col-span-2">
        <Input
          value={values.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          required
          className="h-8"
        />
      </FormField>
      <FormField label="Email" className="sm:col-span-2">
        <Input
          type="email"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          required
          className="h-8"
        />
      </FormField>
      <FormField label="Job title" className="sm:col-span-2">
        <Input
          value={values.jobTitle}
          onChange={(e) => onChange("jobTitle", e.target.value)}
          required
          className="h-8"
        />
      </FormField>
      <FormField label="Department">
        <Select
          value={values.department}
          onValueChange={(v) => onChange("department", v)}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departmentOptions.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Country">
        <Select
          value={values.country}
          onValueChange={(v) => onChange("country", v)}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_OPTIONS.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Currency">
        <Input
          value={values.currency}
          onChange={(e) => onChange("currency", e.target.value.toUpperCase())}
          maxLength={3}
          required
          className="h-8 uppercase"
        />
      </FormField>
      <FormField label="Salary">
        <Input
          type="number"
          min={1}
          step={1}
          value={values.salary}
          onChange={(e) => onChange("salary", e.target.value)}
          required
          className="h-8"
        />
      </FormField>
      <FormField label="Employment type">
        <Select
          value={values.employmentType}
          onValueChange={(v) => onChange("employmentType", v)}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Status">
        <Select value={values.status} onValueChange={(v) => onChange("status", v)}>
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FORM_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Joined" className="sm:col-span-2">
        <Input
          type="date"
          value={values.joinedAt}
          onChange={(e) => onChange("joinedAt", e.target.value)}
          className="h-8"
        />
      </FormField>
    </div>
  );
}

function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
