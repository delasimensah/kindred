"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useGetAppPrompt } from "@/components/public/getAppPromptStore";

const PublicGetAppRoute = () => {
  const openPrompt = useGetAppPrompt((state) => state.openPrompt);
  const router = useRouter();

  useEffect(() => {
    openPrompt();
    router.replace("/browse");
  }, [openPrompt, router]);

  return null;
};

export default PublicGetAppRoute;
