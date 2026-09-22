import { ConvexAuthProvider } from "@convex-dev/auth/react";
import * as SecureStore from "expo-secure-store";
import React, { useMemo } from "react";
import { Platform } from "react-native";

import { FanSessionProvider } from "@/hooks";
import { createConvexClient } from "@/utils";

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const convex = useMemo(() => createConvexClient(), []);

  return (
    <ConvexAuthProvider
      client={convex}
      storage={
        Platform.OS === "ios" || Platform.OS === "android"
          ? secureStorage
          : undefined
      }
    >
      <FanSessionProvider>{children}</FanSessionProvider>
    </ConvexAuthProvider>
  );
};

export default AppProviders;
