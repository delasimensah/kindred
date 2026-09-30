import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import * as Linking from "expo-linking";
import { type Href, Stack, useRouter } from "expo-router";
import { Platform } from "react-native";

import { SessionHomeScreen } from "@/components";
import { COLORS, FONTS } from "@/constants";
import { useFanSession, useRestorePurchases } from "@/hooks";
import {
  ACCOUNT_EDIT_HREF,
  ACCOUNT_IMPACT_HREF,
  ACCOUNT_REQUEST_HREF,
  ACCOUNT_SUPPORT_HREF,
  PAYWALL_HREF,
  storeSubscriptionsUrl,
} from "@/utils";

/**
 * Account presents as a modal over the tabs. On iOS, close is a toolbar button
 * (liquid glass). On Android the system back button dismisses the modal.
 * Manage subscription opens the phone's store subscription list.
 * https://docs.expo.dev/router/advanced/stack-toolbar/
 * https://docs.expo.dev/router/advanced/modals/
 * https://docs.expo.dev/versions/latest/sdk/linking/
 */
const AccountRoute = () => {
  const router = useRouter();
  const { displayName, handleSignOut, isSigningOut } = useFanSession();
  const me = useQuery(api.profiles.getMe, {});
  const mine = useQuery(api.artistRequests.getMine, {});
  const entitlement = useQuery(api.entitlements.getMine, {});
  const { restoring, notice, restore } = useRestorePurchases();
  const supporterLabel =
    entitlement === undefined
      ? undefined
      : entitlement?.status === "active"
        ? `Supporter · $${entitlement.priceTier}/mo`
        : null;

  const openWhenPaying = (href: Href) => {
    if (entitlement === undefined) {
      return;
    }
    if (entitlement?.status === "active") {
      router.push(href);
      return;
    }
    router.push(PAYWALL_HREF);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Account",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: COLORS.text,
          headerStyle: { backgroundColor: COLORS.page },
          headerTitleStyle: {
            color: COLORS.text,
            fontFamily: FONTS.medium,
          },
        }}
      />
      {Platform.OS === "ios" ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            accessibilityLabel="Close"
            icon="xmark"
            tintColor={COLORS.text}
            onPress={() => {
              router.back();
            }}
          />
        </Stack.Toolbar>
      ) : null}
      <SessionHomeScreen
        displayName={displayName}
        email={me?.email ?? ""}
        avatarUrl={me?.avatarUrl ?? null}
        isSigningOut={isSigningOut}
        artistStatus={mine === undefined ? "loading" : mine.status}
        supporterLabel={supporterLabel}
        restoring={restoring}
        notice={notice}
        onRequestArtist={() => {
          router.push(ACCOUNT_REQUEST_HREF);
        }}
        onOpenRoute={() => {
          openWhenPaying(ACCOUNT_SUPPORT_HREF);
        }}
        onOpenImpact={() => {
          openWhenPaying(ACCOUNT_IMPACT_HREF);
        }}
        onRestore={restore}
        onManageSubscription={() => {
          void Linking.openURL(storeSubscriptionsUrl(Platform.OS));
        }}
        onEditProfile={() => {
          router.push(ACCOUNT_EDIT_HREF);
        }}
        onSignOut={() => {
          void handleSignOut();
        }}
      />
    </>
  );
};

export default AccountRoute;
