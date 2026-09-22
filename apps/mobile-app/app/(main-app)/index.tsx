import { SessionHomeScreen } from "@/components";
import { useFanSession } from "@/hooks";

const SessionHomeRoute = () => {
  const { displayName, handleSignOut, isSigningOut } = useFanSession();

  return (
    <SessionHomeScreen
      displayName={displayName}
      isSigningOut={isSigningOut}
      onSignOut={() => {
        void handleSignOut();
      }}
    />
  );
};

export default SessionHomeRoute;
