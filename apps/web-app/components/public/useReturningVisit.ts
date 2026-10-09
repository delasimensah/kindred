"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

const visitedPaths = new Set<string>();

/** True when this page was already opened earlier in the tab, so its entrance motion should not replay. */
export function useReturningVisit() {
  const pathname = usePathname();
  const returning = useMemo(() => visitedPaths.has(pathname), [pathname]);
  useEffect(() => {
    visitedPaths.add(pathname);
  }, [pathname]);
  return returning;
}
