import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";

interface VisualizerToggleProps {
  enabled: boolean;
  lowPower: boolean;
  onChange: (enabled: boolean) => void;
}

const VisualizerToggle: React.FC<VisualizerToggleProps> = ({
  enabled,
  lowPower,
  onChange,
}) => {
  const shown = enabled && !lowPower;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Visualizer"
      accessibilityHint="Stays off in Low Power Mode"
      accessibilityState={{ checked: shown, disabled: lowPower }}
      disabled={lowPower}
      onPress={() => onChange(!enabled)}
      className={`h-11 w-11 items-center justify-center rounded-full ${
        shown ? "bg-primary/15" : ""
      }`}
    >
      <Ionicons
        name="pulse"
        size={20}
        color={shown ? COLORS.primary : COLORS.text}
        style={{ opacity: lowPower ? 0.3 : shown ? 1 : 0.7 }}
      />
    </Pressable>
  );
};

export default VisualizerToggle;
