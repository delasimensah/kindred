import { requireOptionalNativeModule } from "expo-modules-core";
import { useEffect, useState } from "react";

interface ExpoBatteryModule {
  isLowPowerModeEnabledAsync?: () => Promise<boolean>;
  addListener?: (
    eventName: string,
    listener: (event: { lowPowerMode: boolean }) => void
  ) => { remove: () => void };
}

/**
 * iPhone Low Power Mode, and Android battery saver when this build includes it.
 * The current Kindred(Dev) binary does not, so this stays false and the player
 * still opens. https://docs.expo.dev/versions/v57.0.0/sdk/battery/
 */
export function useLowPowerMode(): boolean {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let remove = () => {
      return;
    };

    try {
      const battery =
        requireOptionalNativeModule<ExpoBatteryModule>("ExpoBattery");
      if (battery?.isLowPowerModeEnabledAsync) {
        void battery.isLowPowerModeEnabledAsync().then((enabled) => {
          if (!cancelled) {
            setLowPower(enabled);
          }
        });
      }
      const subscription = battery?.addListener?.(
        "Expo.powerModeDidChange",
        (event) => {
          setLowPower(event.lowPowerMode);
        }
      );
      const unsubscribe = subscription?.remove;
      if (typeof unsubscribe === "function") {
        remove = () => {
          unsubscribe();
        };
      }
    } catch {
      // This build has no battery module. The switch stays usable.
    }

    return () => {
      cancelled = true;
      remove();
    };
  }, []);

  return lowPower;
}
