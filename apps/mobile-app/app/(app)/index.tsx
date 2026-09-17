import { useAuthActions } from "@convex-dev/auth/react";
import { Pressable } from "react-native";

import { Text, VStack } from "@/components";

const HomeScreen = () => {
  const { signOut } = useAuthActions();

  return (
    <VStack className="flex-1 justify-center gap-6 px-6">
      <Text className="text-2xl font-semibold">Kindred</Text>
      <Text className="text-base">
        You are signed in. Fan and supporter screens land in later tickets.
      </Text>
      <Pressable onPress={() => void signOut()}>
        <Text className="text-base underline">Sign out</Text>
      </Pressable>
    </VStack>
  );
};

export default HomeScreen;
