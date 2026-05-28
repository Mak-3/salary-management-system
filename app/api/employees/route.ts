import type { NextRequest } from "next/server";

import {
  EmployeeValidationError,
  createEmployee,
} from "@/lib/employees/mutations";
import { listEmployees } from "@/lib/employees/queries";
import { parseEmployeePayload } from "@/lib/employees/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const result = await listEmployees({
    page: numberParam(searchParams.get("page")),
    pageSize: numberParam(searchParams.get("pageSize")),
    search: searchParams.get("search") ?? undefined,
    department: searchParams.get("department") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    employmentType: searchParams.get("employmentType") ?? undefined,
    sort: (searchParams.get("sort") ?? undefined) as
      | "fullName"
      | "salary"
      | "joinedAt"
      | undefined,
    order: (searchParams.get("order") ?? undefined) as
      | "asc"
      | "desc"
      | undefined,
  });

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const parsed = parseEmployeePayload(await request.json());

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const employee = await createEmployee(parsed.data);
    return Response.json(employee, { status: 201 });
  } catch (error) {
    if (error instanceof EmployeeValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

function numberParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
