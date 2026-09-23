import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Top padding for tab root ScrollViews.
 * iOS native tabs apply automatic content insets; Android does not, so we
 * add the status-bar inset ourselves or titles sit under the system bar.
 * https://docs.expo.dev/versions/latest/sdk/router/native-tabs/
 */
export function useTabScrollTopPad(extra = 8): number {
  const insets = useSafeAreaInsets();
  if (Platform.OS === "ios") {
    return extra;
  }
  return insets.top + extra;
}
