import { useEffect } from "react";
import { BackHandler } from "react-native";

export function useStepBack(shouldIntercept: boolean, onBack: () => void) {
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!shouldIntercept) {
          return false;
        }
        onBack();
        return true;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [onBack, shouldIntercept]);
}
