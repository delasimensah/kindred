import React from "react";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface ArtistUpdateCardProps {
  whenLabel: string;
  audienceLabel: string;
  body: string | null;
  locked: boolean;
}

const ArtistUpdateCard: React.FC<ArtistUpdateCardProps> = ({
  whenLabel,
  audienceLabel,
  body,
  locked,
}) => {
  return (
    <VStack spacing="sm" padding="md" className="rounded-2xl bg-surface">
      <HStack spacing="sm" align="center">
        <Text className="text-xs text-text/40">
          {whenLabel} · {audienceLabel}
        </Text>
      </HStack>
      <Text className="text-sm text-text/80">
        {locked ? "This update is for supporters." : body}
      </Text>
    </VStack>
  );
};

export default ArtistUpdateCard;
