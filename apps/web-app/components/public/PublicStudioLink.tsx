"use client";

import { api } from "@convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import React from "react";

/**
 * Public pages stay signed-out for fans. An artist can sign in, or open
 * their studio profile when they already have a session.
 */
const PublicStudioLink: React.FC = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const viewer = useQuery(api.profiles.getMe, isAuthenticated ? {} : "skip");

  if (isLoading || (isAuthenticated && viewer === undefined)) {
    return null;
  }

  const href = !isAuthenticated
    ? "/sign-in"
    : viewer?.artistId
      ? "/profile"
      : viewer?.isAdmin
        ? "/"
        : null;
  const label = !isAuthenticated
    ? "Sign in"
    : viewer?.artistId
      ? "Profile"
      : "Studio";

  if (href === null) {
    return null;
  }

  return (
    <Link
      href={href}
      className="whitespace-nowrap text-sm font-medium text-text/70 hover:text-text"
    >
      {label}
    </Link>
  );
};

export default PublicStudioLink;
