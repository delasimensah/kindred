import { Alert } from "react-native";

import { getConvexErrorMessage } from "./convexError";

export async function changeFollow(
  change: () => Promise<unknown>
): Promise<void> {
  try {
    await change();
  } catch (error) {
    Alert.alert("Could not update follow", getConvexErrorMessage(error));
  }
}
