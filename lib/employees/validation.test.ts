import { describe, expect, it } from "vitest";

import { parseEmployeePayload } from "./validation";

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    fullName: "Jane Doe",
    email: "jane@example.com",
    jobTitle: "Software Engineer",
    department: "Engineering",
    country: "USA",
    currency: "usd",
    salary: 120_000,
    employmentType: "full_time",
    status: "active",
    joinedAt: "2024-06-15",
    ...overrides,
  };
}

describe("parseEmployeePayload", () => {
  it("accepts a valid payload and normalizes currency", () => {
    const result = parseEmployeePayload(validBody());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data).toEqual({
      fullName: "Jane Doe",
      email: "jane@example.com",
      jobTitle: "Software Engineer",
      department: "Engineering",
      country: "USA",
      currency: "USD",
      salary: 120_000,
      employmentType: "full_time",
      status: "active",
      joinedAt: new Date("2024-06-15").toISOString(),
    });
  });

  it("trims string fields", () => {
    const result = parseEmployeePayload(
      validBody({
        fullName: "  Jane Doe  ",
        email: "  jane@example.com  ",
        jobTitle: "  Engineer  ",
        department: "  Engineering  ",
        country: "  USA  ",
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.fullName).toBe("Jane Doe");
    expect(result.data.email).toBe("jane@example.com");
    expect(result.data.jobTitle).toBe("Engineer");
    expect(result.data.department).toBe("Engineering");
    expect(result.data.country).toBe("USA");
  });

  it("allows null employment type, status, and joined date", () => {
    const result = parseEmployeePayload(
      validBody({
        employmentType: null,
        status: null,
        joinedAt: null,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.employmentType).toBeNull();
    expect(result.data.status).toBeNull();
    expect(result.data.joinedAt).toBeNull();
  });

  it("parses salary from a numeric string", () => {
    const result = parseEmployeePayload(validBody({ salary: "85000" }));

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.salary).toBe(85_000);
  });

  it("rejects invalid request bodies", () => {
    expect(parseEmployeePayload(null)).toEqual({
      ok: false,
      error: "Invalid request body",
    });
    expect(parseEmployeePayload("not an object")).toEqual({
      ok: false,
      error: "Invalid request body",
    });
    expect(parseEmployeePayload([])).toEqual({
      ok: false,
      error: "Invalid request body",
    });
  });

  it("rejects missing required string fields", () => {
    expect(parseEmployeePayload(validBody({ fullName: "" }))).toEqual({
      ok: false,
      error: "Full name is required",
    });
    expect(parseEmployeePayload(validBody({ email: "" }))).toEqual({
      ok: false,
      error: "Email is required",
    });
    expect(parseEmployeePayload(validBody({ jobTitle: "   " }))).toEqual({
      ok: false,
      error: "Job title is required",
    });
    expect(parseEmployeePayload(validBody({ department: "" }))).toEqual({
      ok: false,
      error: "Department is required",
    });
    expect(parseEmployeePayload(validBody({ country: "" }))).toEqual({
      ok: false,
      error: "Country is required",
    });
  });

  it("rejects invalid email addresses", () => {
    const result = parseEmployeePayload(validBody({ email: "not-an-email" }));

    expect(result).toEqual({ ok: false, error: "Invalid email address" });
  });

  it("rejects countries outside the allowed list", () => {
    const result = parseEmployeePayload(validBody({ country: "Mars" }));

    expect(result).toEqual({ ok: false, error: "Invalid country" });
  });

  it("rejects invalid currency codes", () => {
    expect(parseEmployeePayload(validBody({ currency: "" }))).toEqual({
      ok: false,
      error: "Currency must be a 3-letter code",
    });
    expect(parseEmployeePayload(validBody({ currency: "US" }))).toEqual({
      ok: false,
      error: "Currency must be a 3-letter code",
    });
    expect(parseEmployeePayload(validBody({ currency: "USDD" }))).toEqual({
      ok: false,
      error: "Currency must be a 3-letter code",
    });
  });

  it("rejects non-positive salaries", () => {
    expect(parseEmployeePayload(validBody({ salary: 0 }))).toEqual({
      ok: false,
      error: "Salary must be a positive number",
    });
    expect(parseEmployeePayload(validBody({ salary: -1 }))).toEqual({
      ok: false,
      error: "Salary must be a positive number",
    });
    expect(parseEmployeePayload(validBody({ salary: "abc" }))).toEqual({
      ok: false,
      error: "Salary must be a positive number",
    });
  });

  it("rejects invalid employment type and status values", () => {
    expect(
      parseEmployeePayload(validBody({ employmentType: "freelance" })),
    ).toEqual({ ok: false, error: "Invalid employment type" });

    expect(parseEmployeePayload(validBody({ status: "retired" }))).toEqual({
      ok: false,
      error: "Invalid status",
    });
  });

  it("treats invalid joinedAt as null instead of failing", () => {
    const result = parseEmployeePayload(
      validBody({ joinedAt: "not-a-date" }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.joinedAt).toBeNull();
  });
});
