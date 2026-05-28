import type { NextRequest } from "next/server";

import {
  EmployeeNotFoundError,
  EmployeeValidationError,
  deleteEmployee,
  updateEmployee,
} from "@/lib/employees/mutations";
import { parseEmployeePayload } from "@/lib/employees/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const parsed = parseEmployeePayload(await request.json());

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const employee = await updateEmployee(id, parsed.data);
    return Response.json(employee);
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    await deleteEmployee(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleMutationError(error);
  }
}

function handleMutationError(error: unknown): Response {
  if (error instanceof EmployeeNotFoundError) {
    return Response.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof EmployeeValidationError) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  console.error(error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
