import { api } from "@convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import Constants from "expo-constants";
import { useEffect, useState } from "react";

import { canUseTestStore } from "@/utils";

const TEST_STORE_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY;

function bundleId(): string | undefined {
  return (
    Constants.expoConfig?.ios?.bundleIdentifier ??
    Constants.expoConfig?.android?.package
  );
}

/**
 * Restores a practice purchase on Kindred(Dev). The preview app can show the
 * row, and the notice says the practice shop is not on that build.
 */
export function useRestorePurchases(): {
  restoring: boolean;
  notice: string | null;
  restore: () => void;
} {
  const me = useQuery(api.profiles.getMe, {});
  const sync = useAction(api.entitlements.sync);
  const [restoring, setRestoring] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const purchasesEnabled =
    canUseTestStore(bundleId()) &&
    typeof TEST_STORE_KEY === "string" &&
    TEST_STORE_KEY.length > 0;

  useEffect(() => {
    if (
      !purchasesEnabled ||
      me === undefined ||
      me === null ||
      TEST_STORE_KEY === undefined
    ) {
      return;
    }
    void import("react-native-purchases").then(({ default: Purchases }) => {
      void Purchases.configure({
        apiKey: TEST_STORE_KEY,
        appUserID: me.profileId,
      });
    });
  }, [me, purchasesEnabled]);

  const restore = () => {
    if (!purchasesEnabled) {
      setNotice("Practice restore works on Kindred(Dev).");
      return;
    }
    setRestoring(true);
    setNotice("Confirming your support");
    void import("react-native-purchases")
      .then(async ({ default: Purchases }) => {
        await Purchases.restorePurchases();
        try {
          const confirmed = await sync();
          setNotice(
            confirmed.entitled
              ? "Your subscription is restored."
              : "Restore finished. Kindred has not confirmed it yet."
          );
        } catch {
          setNotice("Restore finished. Kindred has not confirmed it yet.");
        }
      })
      .catch(() => {
        setNotice("Restore did not finish.");
      })
      .finally(() => {
        setRestoring(false);
      });
  };

  return { restoring, notice, restore };
}
