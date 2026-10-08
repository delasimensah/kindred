import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView } from "react-native";

import { COLORS } from "@/constants";
import { PAYWALL_BULLETS, PAYWALL_PLANS } from "@/utils";

import Button from "../../../ui/Button/Button";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export interface PaywallArtist {
  name: string;
  avatarUrl: string | null;
}

interface PaywallSheetProps {
  artist?: PaywallArtist | null;
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
  onSubscribe: () => void;
  onRestore: () => void;
  onClose: () => void;
  subscribing: boolean;
  restoring: boolean;
  notice: string | null;
}

const PaywallSheet: React.FC<PaywallSheetProps> = ({
  artist = null,
  selectedPlanId,
  onSelectPlan,
  onSubscribe,
  onRestore,
  onClose,
  subscribing,
  restoring,
  notice,
}) => {
  return (
    <VStack className="flex-1 justify-end bg-black/40">
      <VStack className="max-h-[90%] rounded-t-[32px] border-t border-white/5 bg-page px-6 pb-8 pt-3">
        <HStack justify="center" className="pb-1">
          <VStack className="h-1.5 w-10 rounded-full bg-text/20" />
        </HStack>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          className="absolute right-5 top-5 z-20 h-9 w-9 items-center justify-center rounded-full bg-surface"
        >
          <Ionicons name="close" size={14} color={COLORS.text} />
        </Pressable>
        <ScrollView>
          <VStack spacing="lg" className="pt-6">
            <VStack spacing="sm" className="pr-8">
              {artist ? (
                <PersonAvatar
                  displayName={artist.name}
                  imageUrl={artist.avatarUrl}
                  size={56}
                />
              ) : (
                <VStack
                  align="center"
                  justify="center"
                  className="mb-1 h-11 w-11 rounded-2xl bg-primary"
                >
                  <Ionicons name="heart" size={18} color={COLORS.page} />
                </VStack>
              )}
              <Text className="font-display-bold text-[26px] leading-tight tracking-tight text-text">
                {artist
                  ? `Support ${artist.name}`
                  : "Back the artists you believe in."}
              </Text>
              <Text className="text-sm leading-relaxed text-text/60">
                One subscription. Route it to up to 5 artists. Same access at
                both prices.
              </Text>
            </VStack>
            <VStack spacing="sm">
              {PAYWALL_BULLETS.map((bullet) => (
                <HStack key={bullet} align="center" spacing="sm">
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text className="text-sm text-text/80">{bullet}</Text>
                </HStack>
              ))}
            </VStack>
            <VStack spacing="sm">
              {PAYWALL_PLANS.map((plan) => {
                const selected = plan.id === selectedPlanId;
                return (
                  <Pressable
                    key={plan.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${plan.name} ${plan.price} per month`}
                    onPress={() => {
                      onSelectPlan(plan.id);
                    }}
                    className={`rounded-2xl border-2 bg-surface px-4 py-3.5 ${
                      selected ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <HStack align="center" spacing="md">
                      <VStack
                        align="center"
                        justify="center"
                        className={`h-6 w-6 shrink-0 rounded-full border-2 ${
                          selected ? "border-primary" : "border-text/25"
                        }`}
                      >
                        <VStack
                          className={`h-3 w-3 rounded-full bg-primary ${
                            selected ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </VStack>
                      <VStack spacing="none" className="min-w-0 flex-1">
                        <HStack align="center" spacing="sm">
                          <Text className="font-app-semibold text-base text-text">
                            {plan.name}
                          </Text>
                          {plan.badge !== null ? (
                            <Text className="rounded-full bg-primary/15 px-2 py-0.5 font-app-semibold text-[11px] text-primary">
                              {plan.badge}
                            </Text>
                          ) : null}
                        </HStack>
                        <Text className="mt-0.5 text-xs text-text/50">
                          {`${plan.artistShare} a month to your artists`}
                        </Text>
                      </VStack>
                      <HStack align="end" spacing="xs">
                        <Text className="font-display-bold text-xl text-text">
                          {plan.price}
                        </Text>
                        <Text className="pb-0.5 text-xs text-text/50">
                          / month
                        </Text>
                      </HStack>
                    </HStack>
                  </Pressable>
                );
              })}
            </VStack>
            <VStack align="center" spacing="md" className="pt-1">
              <Button
                text="Subscribe"
                size="lg"
                fullWidth
                loading={subscribing}
                className="rounded-full"
                onPress={onSubscribe}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Restore purchases"
                onPress={onRestore}
                disabled={restoring}
              >
                <Text className="text-center font-app-medium text-sm text-text/50 underline underline-offset-2">
                  {restoring ? "Restoring…" : "Restore purchases"}
                </Text>
              </Pressable>
              <Text className="px-4 text-center text-[11px] leading-relaxed text-text/30">
                Cancel anytime. Renews automatically until cancelled.
              </Text>
              {notice !== null ? (
                <Text className="text-center text-sm text-text/60">
                  {notice}
                </Text>
              ) : null}
            </VStack>
          </VStack>
        </ScrollView>
      </VStack>
    </VStack>
  );
};

export default PaywallSheet;
