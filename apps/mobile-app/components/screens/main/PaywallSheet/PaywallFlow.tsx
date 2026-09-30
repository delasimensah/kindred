import { api } from "@convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";

import { canUseTestStore, PAYWALL_PLANS } from "@/utils";

import PaywallSheet from "./PaywallSheet";

const TEST_STORE_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY;

function bundleId(): string | undefined {
  return (
    Constants.expoConfig?.ios?.bundleIdentifier ??
    Constants.expoConfig?.android?.package
  );
}

interface PaywallFlowProps {
  onClose: () => void;
  onConfirmed: () => void;
}

const PaywallFlow: React.FC<PaywallFlowProps> = ({ onClose, onConfirmed }) => {
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
          const confirmed = await sync();
          if (!confirmed.entitled) {
            setNotice("Purchase finished. Kindred has not confirmed it yet.");
            return;
          }
          onConfirmed();
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
          const confirmed = await sync();
          if (!confirmed.entitled) {
            setNotice("Restore finished. Kindred has not confirmed it yet.");
            return;
          }
          onConfirmed();
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
    <PaywallSheet
      selectedPlanId={selectedPlanId}
      onSelectPlan={setSelectedPlanId}
      onSubscribe={subscribe}
      onRestore={restore}
      onClose={onClose}
      subscribing={subscribing}
      restoring={restoring}
      notice={notice}
    />
  );
};

export default PaywallFlow;
