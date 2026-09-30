import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { Pressable } from "react-native";
import { REACTION_COUNT_KEY, REACTION_EMOJIS } from "shared";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface TrackReactionRowProps {
  trackId: string;
  enabled: boolean;
}

function listedMine(
  listed:
    | {
        mine: string | null;
        counts: Record<string, number>;
      }
    | undefined
): { mine: string | null; counts: Record<string, number> } {
  if (listed === undefined || typeof listed !== "object") {
    return { mine: null, counts: {} };
  }
  return listed;
}

const TrackReactionRow: React.FC<TrackReactionRowProps> = ({
  trackId,
  enabled,
}) => {
  const listed = useQuery(
    api.reactions.listForTrack,
    enabled ? { trackId: trackId as Id<"tracks"> } : "skip"
  );
  const setReaction = useMutation(api.reactions.set);
  const clearReaction = useMutation(api.reactions.clear);
  const { mine, counts } = listedMine(listed);

  return (
    <HStack align="center" justify="center" spacing="sm" className="mt-7">
      {REACTION_EMOJIS.map((emoji) => {
        const selected = mine === emoji;
        const count = counts[REACTION_COUNT_KEY[emoji]] ?? 0;
        return (
          <Pressable
            key={emoji}
            accessibilityRole="button"
            accessibilityLabel={`React with ${emoji}`}
            accessibilityState={{ selected }}
            onPress={() => {
              if (!enabled) {
                return;
              }
              if (selected) {
                void clearReaction({
                  trackId: trackId as Id<"tracks">,
                });
                return;
              }
              void setReaction({
                trackId: trackId as Id<"tracks">,
                emoji,
                clientEventId: `reaction:${trackId}:${emoji}:${Date.now()}`,
              });
            }}
            className="h-11 w-11 items-center justify-center rounded-full bg-surface"
            style={
              selected
                ? { borderWidth: 2, borderColor: COLORS.primary }
                : undefined
            }
          >
            <VStack spacing="none" align="center">
              <Text className="text-xl">{emoji}</Text>
              {count > 0 ? (
                <Text className="text-[10px] text-text/60">{count}</Text>
              ) : null}
            </VStack>
          </Pressable>
        );
      })}
    </HStack>
  );
};

export default TrackReactionRow;
