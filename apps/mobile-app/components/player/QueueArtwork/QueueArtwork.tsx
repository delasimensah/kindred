import React from "react";

import CoverImage from "../../ui/CoverImage/CoverImage";

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
  return (
    <CoverImage
      uri={url}
      width={size}
      height={size}
      radius={8}
      opacity={dimmed ? 0.7 : 1}
      accessibilityLabel="Track artwork"
    />
  );
};

export default QueueArtwork;
