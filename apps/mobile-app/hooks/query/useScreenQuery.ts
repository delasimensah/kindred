import { useQuery_experimental } from "convex/react";
import type { FunctionArgs, FunctionReference } from "convex/server";

export function useScreenQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>
) {
  return useQuery_experimental({ query, args });
}
