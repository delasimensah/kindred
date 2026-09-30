import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";

import {
  getConvexErrorMessage,
  initialRouteSelection,
  MAX_ROUTES,
  routeParam,
  toggleRouteArtist,
} from "@/utils";

import Text from "../../../ui/Text/Text";
import RouteSupportScreen from "./RouteSupportScreen";

const RouteSupportFlow = ({ embedded = false }: { embedded?: boolean }) => {
  const router = useRouter();
  const startingArtistId = routeParam(
    useLocalSearchParams<{ artistId?: string }>().artistId
  );
  const picker = useQuery(api.routes.picker, {
    startingArtistId:
      startingArtistId === undefined
        ? undefined
        : (startingArtistId as Id<"artists">),
  });
  const saveRoutes = useMutation(api.routes.setRouteSet);
  const follow = useMutation(api.follows.add);
  const [override, setOverride] = useState<{
    selectedIds: string[];
    lockedArtistId: string | null;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const starting = picker?.startingArtist ?? null;
  const needsFollow = starting !== null && !starting.followed;
  const seeded =
    picker === undefined || needsFollow
      ? null
      : initialRouteSelection({
          followedIds: picker.artists.map((artist) => artist.artistId),
          routedIds: picker.routedArtistIds,
          startingArtistId:
            starting?.followed === true ? starting.artistId : undefined,
        });
  const selectedIds = override?.selectedIds ?? seeded?.selectedIds ?? [];
  const lockedArtistId =
    override?.lockedArtistId ?? seeded?.lockedArtistId ?? null;

  const onFollow = () => {
    if (starting === null) {
      return;
    }
    setIsFollowing(true);
    void follow({ artistId: starting.artistId })
      .catch((error: unknown) => {
        setNotice(getConvexErrorMessage(error, "Follow did not finish."));
      })
      .finally(() => {
        setIsFollowing(false);
      });
  };

  const onSave = () => {
    if (savingRef.current || (seeded === null && override === null)) {
      return;
    }
    if (picker !== undefined && !picker.entitled) {
      setNotice(
        "Your subscription is not active, so this route was not saved."
      );
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    setNotice(null);
    void saveRoutes({
      artistIds: selectedIds as Id<"artists">[],
      startingArtistId:
        lockedArtistId === null ? undefined : (lockedArtistId as Id<"artists">),
    })
      .then(() => {
        router.back();
      })
      .catch((error: unknown) => {
        setNotice(getConvexErrorMessage(error, "Routing did not save."));
        savingRef.current = false;
        setIsSaving(false);
      });
  };

  const shownNotice =
    notice ??
    (picker !== undefined && !picker.entitled
      ? "Your subscription is not active yet. Confirm it before saving this route."
      : null);

  return (
    <>
      {embedded ? (
        <Stack.Screen
          options={{
            headerRight: () => (
              <Text className="font-app-semibold text-sm text-primary">
                {selectedIds.length} / {MAX_ROUTES}
              </Text>
            ),
          }}
        />
      ) : null}
      <RouteSupportScreen
        embedded={embedded}
        artists={picker?.artists ?? []}
        selectedIds={selectedIds}
        routedArtistIds={picker?.routedArtistIds ?? []}
        lockedArtistId={lockedArtistId}
        followFirstName={needsFollow ? starting.name : null}
        isLoading={picker === undefined}
        isSaving={isSaving}
        subscriptionActive={picker === undefined || picker.entitled}
        isFollowing={isFollowing}
        notice={shownNotice}
        onBack={() => {
          router.back();
        }}
        onToggle={(artistId) => {
          setOverride({
            selectedIds: toggleRouteArtist(
              selectedIds,
              artistId,
              lockedArtistId
            ),
            lockedArtistId,
          });
        }}
        onFollow={onFollow}
        onSave={onSave}
      />
    </>
  );
};

export default RouteSupportFlow;
