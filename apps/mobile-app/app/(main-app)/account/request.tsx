import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { ArtistRequestScreen, ArtistRequestSkeleton } from "@/components";
import { getConvexErrorMessage, showErrorToast } from "@/utils";

/**
 * Multiline fields stay above the keyboard because KeyboardFormView scrolls
 * with automaticallyAdjustKeyboardInsets.
 * https://docs.expo.dev/guides/keyboard-handling/
 * https://reactnative.dev/docs/textinput#multiline
 */
const ArtistRequestRoute = () => {
  const mine = useQuery(api.artistRequests.getMine, {});
  const submit = useMutation(api.artistRequests.submit);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  if (mine === undefined) {
    return <ArtistRequestSkeleton />;
  }

  const status =
    sent && (mine.status === "none" || mine.status === "declined")
      ? "pending"
      : mine.status;

  return (
    <ArtistRequestScreen
      status={status}
      displayName={mine.displayName}
      bio={mine.bio}
      note={mine.note}
      declineReason={mine.declineReason}
      createdAt={mine.createdAt}
      submitting={submitting}
      onSubmit={(values) => {
        setSubmitting(true);
        void submit(values)
          .then(() => {
            setSent(true);
          })
          .catch((error: unknown) => {
            showErrorToast(getConvexErrorMessage(error));
          })
          .finally(() => {
            setSubmitting(false);
          });
      }}
    />
  );
};

export default ArtistRequestRoute;
