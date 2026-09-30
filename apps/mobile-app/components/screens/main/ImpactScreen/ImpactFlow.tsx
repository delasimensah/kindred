import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React from "react";

import { ACCOUNT_SUPPORT_HREF } from "@/utils";

import ImpactScreen from "./ImpactScreen";

const ImpactFlow: React.FC = () => {
  const router = useRouter();
  const impact = useQuery(api.routes.impact, {});

  return (
    <ImpactScreen
      isLoading={impact === undefined}
      entitled={impact?.entitled ?? false}
      totalCents={impact?.totalCents ?? 0}
      sinceCents={impact?.sinceCents ?? 0}
      artists={impact?.artists ?? []}
      onManageRouting={() => {
        router.push(ACCOUNT_SUPPORT_HREF);
      }}
    />
  );
};

export default ImpactFlow;
