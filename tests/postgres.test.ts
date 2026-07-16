import { describe, expect, test } from "bun:test";
import { validatePostgresMutation } from "../src/postgres.js";

describe("PostgreSQL mutation scope", () => {
  test.each([
    "DELETE FROM private.users",
    "UPDATE public.users SET id = (SELECT id FROM private.users LIMIT 1)",
    "DELETE FROM public.users WHERE lower(name) = 'ada'",
    "DELETE FROM public.users; DELETE FROM public.sessions",
    "ALTER TABLE public.users DROP COLUMN name",
  ])("rejects SQL outside the exact supported boundary: %s", (sql) => {
    expect(() => validatePostgresMutation(sql, "public")).toThrow();
  });

  test.each([
    "DELETE FROM public.users WHERE id = 1",
    "UPDATE users SET name = 'Ada' WHERE id = 1",
    "TRUNCATE public.sessions",
    "DROP TABLE public.expired_sessions",
    "DROP INDEX public.users_name_idx",
  ])("accepts one schema-scoped destructive statement: %s", (sql) => {
    expect(() => validatePostgresMutation(sql, "public")).not.toThrow();
  });
});
