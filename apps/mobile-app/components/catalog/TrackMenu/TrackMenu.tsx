import { type MenuAction, MenuView } from "@expo/ui/community/menu";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import { COLORS } from "@/constants";
import { STAND_IN_TRACK_ID } from "@/hooks";
import { showLikedToast } from "@/utils";

import AddToPlaylistSheet from "../../bottom-sheets/AddToPlaylistSheet/AddToPlaylistSheet";
import { HStack } from "../../ui/Stack/Stack";

interface TrackMenuProps {
  title: string;
  trackId: string;
  artworkUrl?: string | null;
  liked?: boolean;
  onPlayNext?: () => void;
  onAddToQueue?: () => void;
  onToggleLike?: () => void;
  onRemove?: () => void;
  /** Dark circle behind the icon, for controls that sit on artwork. */
  filled?: boolean;
  /** Locked tracks stay in the list. The menu does not open. */
  disabled?: boolean;
}

const TrackMenu: React.FC<TrackMenuProps> = ({
  title,
  trackId,
  liked = false,
  onPlayNext,
  onAddToQueue,
  onToggleLike,
  onRemove,
  filled = false,
  disabled = false,
}) => {
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const realTrack = trackId !== STAND_IN_TRACK_ID;
  const actions: MenuAction[] = [];

  if (onPlayNext) {
    actions.push({
      id: "play-next",
      title: "Play next",
      image: "text.line.first.and.arrowtriangle.forward",
    });
  }
  if (onAddToQueue) {
    actions.push({
      id: "add-queue",
      title: "Add to queue",
      image: "text.badge.plus",
    });
  }
  if (onToggleLike && realTrack) {
    actions.push({
      id: "like",
      title: liked ? `Unlike ${title}` : `Like ${title}`,
      image: liked ? "heart.fill" : "heart",
    });
  }
  if (realTrack) {
    actions.push({
      id: "add-playlist",
      title: "Add to playlist",
      image: "text.badge.plus",
    });
  }
  if (onRemove) {
    actions.push({
      id: "remove",
      title: `Delete ${title}`,
      image: "trash",
      attributes: { destructive: true },
    });
  }

  if (disabled) {
    return <TrackMenuIcon title={title} filled={filled} disabled />;
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <MenuView
        colorScheme="dark"
        actions={actions}
        onPressAction={({ nativeEvent }) => {
          if (nativeEvent.event === "play-next") {
            onPlayNext?.();
          } else if (nativeEvent.event === "add-queue") {
            onAddToQueue?.();
          } else if (nativeEvent.event === "like") {
            onToggleLike?.();
            showLikedToast(!liked);
          } else if (nativeEvent.event === "add-playlist") {
            setPlaylistOpen(true);
          } else if (nativeEvent.event === "remove") {
            onRemove?.();
          }
        }}
      >
        <TrackMenuIcon title={title} filled={filled} />
      </MenuView>
      {playlistOpen ? (
        <AddToPlaylistSheet
          trackId={trackId}
          open
          onClose={() => setPlaylistOpen(false)}
        />
      ) : null}
    </>
  );
};

function TrackMenuIcon({
  title,
  filled,
  disabled = false,
}: {
  title: string;
  filled: boolean;
  disabled?: boolean;
}) {
  return (
    <HStack
      spacing="none"
      align="center"
      justify="center"
      accessibilityRole="button"
      accessibilityLabel={`More options for ${title}`}
      accessibilityState={{ disabled }}
      pointerEvents={disabled ? "none" : "auto"}
      className={
        filled
          ? "h-11 w-11 items-center justify-center rounded-full bg-surface"
          : "h-11 w-11"
      }
      style={disabled ? { opacity: 0.35 } : undefined}
    >
      <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text} />
    </HStack>
  );
}

export default TrackMenu;
