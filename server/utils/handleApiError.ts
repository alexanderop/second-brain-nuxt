import { createError, isError } from "h3";
import type { H3Error } from "h3";

function isH3Error(error: unknown): error is H3Error {
  return isError(error);
}

export function handleApiError(error: unknown, context: string): never {
  console.error(`[${context}]`, error);

  if (isH3Error(error)) {
    throw error;
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  throw createError({ statusCode: 500, message });
}
