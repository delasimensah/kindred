import { useRouter } from "expo-router";

import { SessionHomeScreen } from "@/components";
import { useFanSession } from "@/hooks";

const AccountRoute = () => {
  const router = useRouter();
  const { displayName, handleSignOut, isSigningOut } = useFanSession();

  return (
    <SessionHomeScreen
      displayName={displayName}
      isSigningOut={isSigningOut}
      onBack={() => {
        router.back();
      }}
      onSignOut={() => {
        void handleSignOut();
      }}
    />
  );
};

export default AccountRoute;
