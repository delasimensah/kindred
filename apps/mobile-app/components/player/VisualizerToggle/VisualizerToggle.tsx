import { Ionicons } from "@expo/vector-icons";
import { Switch } from "react-native";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

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
    <HStack
      align="center"
      justify="between"
      className="mt-4 rounded-2xl bg-surface/50 px-4 py-3"
    >
      <HStack align="center" spacing="md" className="min-w-0 flex-1">
        <Ionicons name="pulse" size={18} color={COLORS.text} />
        <VStack spacing="none" className="min-w-0 flex-1">
          <Text className="font-app-medium text-sm text-text">Visualizer</Text>
          <Text className="text-[11px] text-text/40">
            Stays off in Low Power Mode
          </Text>
        </VStack>
      </HStack>
      <Switch
        accessibilityLabel="Visualizer"
        accessibilityState={{ disabled: lowPower }}
        value={shown}
        disabled={lowPower}
        onValueChange={onChange}
        trackColor={{ false: COLORS.page, true: COLORS.primary }}
        thumbColor={COLORS.text}
      />
    </HStack>
  );
};

export default VisualizerToggle;
