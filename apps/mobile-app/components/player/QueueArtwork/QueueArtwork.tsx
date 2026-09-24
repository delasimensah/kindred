import { Image } from "expo-image";

import { VStack } from "../../ui/Stack/Stack";

interface QueueArtworkProps {
  url: string | null;
  size: number;
  dimmed?: boolean;
}

const QueueArtwork: React.FC<QueueArtworkProps> = ({
  url,
  size,
  dimmed = false,
}) => {
  if (!url) {
    return (
      <VStack
        spacing="none"
        accessibilityLabel="Track artwork"
        className="rounded-lg bg-page"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Image
      accessibilityLabel="Track artwork"
      source={{ uri: url }}
      contentFit="cover"
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        opacity: dimmed ? 0.7 : 1,
      }}
    />
  );
};

export default QueueArtwork;
