type ExpoHapticsModule = {
  impactAsync?: (style: string) => Promise<void>;
};

/**
 * A short tap. Does nothing on a binary built before haptics was added,
 * so the current phone never loads the package or shows an error.
 */
export async function tapHaptic(kind: "select" | "drop") {
  const native = (
    globalThis as {
      expo?: { modules?: { ExpoHaptics?: ExpoHapticsModule } };
    }
  ).expo?.modules?.ExpoHaptics;

  if (!native?.impactAsync) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Haptics = require("expo-haptics") as typeof import("expo-haptics");
    await Haptics.impactAsync(
      kind === "select"
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );
  } catch {
    // The native module disappeared between the check and the call.
  }
}
