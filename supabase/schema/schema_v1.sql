-- Salary Management System — initial schema (departments + employees)

-- ---------------------------------------------------------------------------
-- Enums (employment_type & status use constrained values per ERD)
-- ---------------------------------------------------------------------------

CREATE TYPE public.employment_type AS ENUM (
  'full_time',
  'part_time',
  'contract',
  'intern'
);

CREATE TYPE public.employee_status AS ENUM (
  'active',
  'inactive',
  'on_leave',
  'terminated'
);

-- ---------------------------------------------------------------------------
-- departments
-- ---------------------------------------------------------------------------

CREATE TABLE public.departments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT departments_name_unique UNIQUE (name)
);

COMMENT ON TABLE public.departments IS 'Organizational departments; one department has many employees.';

-- ---------------------------------------------------------------------------
-- employees
-- ---------------------------------------------------------------------------

CREATE TABLE public.employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  job_title       VARCHAR(255) NOT NULL,
  department_id   UUID NOT NULL REFERENCES public.departments (id) ON DELETE RESTRICT,
  country         VARCHAR(100) NOT NULL,
  currency        VARCHAR(3) NOT NULL,
  salary          DECIMAL(12, 2) NOT NULL,
  employment_type public.employment_type,
  status          public.employee_status,
  joined_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT employees_email_unique UNIQUE (email),
  CONSTRAINT employees_salary_non_negative CHECK (salary >= 0)
);

COMMENT ON TABLE public.employees IS 'Employees; each belongs to exactly one department (department_employees).';

CREATE INDEX employees_department_id_idx ON public.employees (department_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER departments_set_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER employees_set_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (open policies until auth is added — see notes.txt)
-- ---------------------------------------------------------------------------

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "departments_allow_all"
  ON public.departments
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "employees_allow_all"
  ON public.employees
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
