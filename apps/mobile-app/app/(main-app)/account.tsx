import { Stack, useRouter } from "expo-router";
import { Platform } from "react-native";

import { SessionHomeScreen } from "@/components";
import { COLORS, FONTS } from "@/constants";
import { useFanSession } from "@/hooks";

/**
 * Account presents as a modal over the tabs. On iOS, close is a toolbar button
 * (liquid glass). On Android the stack back button is enough, so no close.
 * https://docs.expo.dev/router/advanced/stack-toolbar/
 * https://docs.expo.dev/router/advanced/modals/
 */
const AccountRoute = () => {
  const router = useRouter();
  const { displayName, handleSignOut, isSigningOut } = useFanSession();

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
        onSignOut={() => {
          void handleSignOut();
        }}
      />
    </>
  );
};

export default AccountRoute;
