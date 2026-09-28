import type { Metadata } from "next";
import React from "react";

import PublicShell from "@/components/public/PublicShell";

export const metadata: Metadata = {
  title: "Kindred",
  description:
    "Public songs from rising African artists. Exclusives open in the Kindred app.",
};

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return <PublicShell>{children}</PublicShell>;
};

export default PublicLayout;
