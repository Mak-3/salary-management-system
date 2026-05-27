import { PrismaClient } from "@prisma/client";

import { DEPARTMENT_NAMES } from "./seed/data/departments";
import { FIRST_NAME_COUNT, LAST_NAME_COUNT } from "./seed/data/names";
import { generateEmployees } from "./seed/generate-employees";

const BATCH_SIZE = 500;

const prisma = new PrismaClient();

async function seedDepartments(): Promise<Map<string, string>> {
  const idByName = new Map<string, string>();

  for (const name of DEPARTMENT_NAMES) {
    const department = await prisma.department.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    idByName.set(name, department.id);
  }

  return idByName;
}

async function seedEmployees(departmentIds: Map<string, string>) {
  const rows = generateEmployees();

  if (rows.length !== FIRST_NAME_COUNT * LAST_NAME_COUNT) {
    throw new Error(
      `Expected ${FIRST_NAME_COUNT * LAST_NAME_COUNT} employees, got ${rows.length}`,
    );
  }

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await prisma.employee.createMany({
      data: batch.map((row) => ({
        fullName: row.fullName,
        email: row.email,
        jobTitle: row.jobTitle,
        departmentId: departmentIds.get(row.departmentName)!,
        country: row.country,
        currency: row.currency,
        salary: row.salary,
        employmentType: row.employmentType,
        status: row.status,
        joinedAt: row.joinedAt,
      })),
      skipDuplicates: true,
    });
    console.log(
      `  employees ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`,
    );
  }
}

async function main() {
  console.log("Seeding departments…");
  const departmentIds = await seedDepartments();

  console.log(
    `Seeding ${FIRST_NAME_COUNT} × ${LAST_NAME_COUNT} = ${FIRST_NAME_COUNT * LAST_NAME_COUNT} employees…`,
  );
  await seedEmployees(departmentIds);

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
