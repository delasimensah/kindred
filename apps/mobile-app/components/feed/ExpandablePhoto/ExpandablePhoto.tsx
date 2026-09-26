import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, Pressable, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";

interface ExpandablePhotoProps {
  uri: string;
  label: string;
}

const ExpandablePhoto: React.FC<ExpandablePhotoProps> = ({ uri, label }) => {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const close = () => {
    setOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => {
          setOpen(true);
        }}
      >
        <Image
          source={{ uri }}
          contentFit="cover"
          style={{
            width: "100%",
            height: 200,
            borderRadius: 12,
            backgroundColor: COLORS.surface,
          }}
        />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close photo"
          onPress={close}
          style={{ flex: 1, backgroundColor: COLORS.black }}
        >
          <VStack spacing="none" className="flex-1">
            <HStack
              spacing="none"
              justify="end"
              style={{ paddingTop: insets.top + 8, paddingRight: 16 }}
            >
              <HStack
                spacing="none"
                align="center"
                justify="center"
                className="h-10 w-10 rounded-full bg-surface"
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </HStack>
            </HStack>
            <Image
              accessibilityLabel={label}
              source={{ uri }}
              contentFit="contain"
              style={{
                width,
                height: height - insets.top - 64,
                backgroundColor: COLORS.black,
              }}
            />
          </VStack>
        </Pressable>
      </Modal>
    </>
  );
};

export default ExpandablePhoto;
