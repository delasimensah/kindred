"use client";

import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { useMemo } from "react";

export type ScreenQueryState<Query extends FunctionReference<"query">> =
  | { status: "pending"; data: undefined; error: undefined }
  | { status: "success"; data: FunctionReturnType<Query>; error: undefined }
  | { status: "error"; data: undefined; error: Error };

/** Cached: a screen you come back to within a few minutes renders without loading again. */
export function useScreenQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>
): ScreenQueryState<Query> {
  const argsKey = JSON.stringify(args);
  const request = useMemo(
    () => ({ screen: { query, args } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, argsKey]
  );
  const result: unknown = useQueries(request).screen;
  if (result === undefined) {
    return { status: "pending", data: undefined, error: undefined };
  }
  if (result instanceof Error) {
    return { status: "error", data: undefined, error: result };
  }
  return {
    status: "success",
    data: result as FunctionReturnType<Query>,
    error: undefined,
  };
}
