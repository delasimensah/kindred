import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";
import { Platform } from "react-native";

import { SessionHomeScreen } from "@/components";
import { COLORS, FONTS } from "@/constants";
import { useFanSession } from "@/hooks";
import { ACCOUNT_REQUEST_HREF } from "@/utils";

/**
 * Account presents as a modal over the tabs. On iOS, close is a toolbar button
 * (liquid glass). On Android the system back button dismisses the modal.
 * https://docs.expo.dev/router/advanced/stack-toolbar/
 * https://docs.expo.dev/router/advanced/modals/
 */
const AccountRoute = () => {
  const router = useRouter();
  const { displayName, handleSignOut, isSigningOut } = useFanSession();
  const mine = useQuery(api.artistRequests.getMine, {});

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
        isSigningOut={isSigningOut}
        artistStatus={mine === undefined ? "loading" : mine.status}
        onRequestArtist={() => {
          router.push(ACCOUNT_REQUEST_HREF);
        }}
        onSignOut={() => {
          void handleSignOut();
        }}
      />
    </>
  );
};

export default AccountRoute;
