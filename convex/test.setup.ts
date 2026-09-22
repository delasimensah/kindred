/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";

import type { Id } from "./_generated/dataModel";
import schema from "./schema";

export const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/**/*.js",
  "!./**/*.test.ts",
  "!./test.setup.ts",
]);

export function makeBackend() {
  return convexTest(schema, modules);
}

export function errorCode(error: unknown): string | undefined {
  if (
    error instanceof ConvexError &&
    typeof error.data === "object" &&
    error.data !== null &&
    "code" in error.data
  ) {
    return String((error.data as { code: string }).code);
  }
  return undefined;
}

export function asUser(t: ReturnType<typeof makeBackend>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId });
}
