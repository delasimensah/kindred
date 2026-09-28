"use client";

import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 text-xs text-text/40">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li
              key={`${item.href ?? "current"}-${item.label}`}
              className="flex min-w-0 items-center gap-x-2"
            >
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href !== undefined && !current ? (
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span className="truncate" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
