import { api } from "@convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { PaywallSheet } from "@/components";
import { canUseTestStore, PAYWALL_PLANS } from "@/utils";

const TEST_STORE_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY;

function bundleId(): string | undefined {
  return (
    Constants.expoConfig?.ios?.bundleIdentifier ??
    Constants.expoConfig?.android?.package
  );
}

const PaywallRoute = () => {
  const router = useRouter();
  const me = useQuery(api.profiles.getMe, {});
  const sync = useAction(api.entitlements.sync);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    PAYWALL_PLANS[1].id
  );
  const [subscribing, setSubscribing] = useState(false);
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

  const subscribe = () => {
    if (!purchasesEnabled) {
      setNotice(null);
      return;
    }
    setSubscribing(true);
    setNotice("Confirming your support");
    void import("react-native-purchases")
      .then(async ({ default: Purchases }) => {
        const offerings = await Purchases.getOfferings();
        const pack = offerings.current?.availablePackages.find(
          (item) => item.product.identifier === selectedPlanId
        );
        if (pack === undefined) {
          setNotice("That price is not available yet.");
          return;
        }
        await Purchases.purchasePackage(pack);
        setNotice("Confirming your support");
        try {
          await sync();
          router.back();
        } catch {
          setNotice("Purchase finished. Kindred has not confirmed it yet.");
        }
      })
      .catch((error: unknown) => {
        const cancelled =
          typeof error === "object" &&
          error !== null &&
          "userCancelled" in error &&
          (error as { userCancelled?: boolean }).userCancelled === true;
        setNotice(cancelled ? null : "The purchase did not finish.");
      })
      .finally(() => {
        setSubscribing(false);
      });
  };

  const restore = () => {
    if (!purchasesEnabled) {
      setNotice(null);
      return;
    }
    setRestoring(true);
    void import("react-native-purchases")
      .then(async ({ default: Purchases }) => {
        await Purchases.restorePurchases();
        setNotice("Confirming your support");
        try {
          await sync();
          router.back();
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

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false, presentation: "transparentModal" }}
      />
      <PaywallSheet
        selectedPlanId={selectedPlanId}
        onSelectPlan={setSelectedPlanId}
        onSubscribe={subscribe}
        onRestore={restore}
        onClose={() => {
          router.back();
        }}
        subscribing={subscribing}
        restoring={restoring}
        notice={notice}
      />
    </>
  );
};

export default PaywallRoute;
