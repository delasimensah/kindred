"use client";

import { api } from "@convex/_generated/api";
import { AppShell, Burger, Group, Overlay } from "@mantine/core";
import {
  useDisclosure,
  useHotkeys,
  useLocalStorage,
  useMediaQuery,
} from "@mantine/hooks";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

import { ASSETS } from "@/constants";
import { useStudioSession } from "@/hooks";

import StudioSidebar, {
  type StudioNavId,
} from "../StudioSidebar/StudioSidebar";

interface StudioAppShellProps {
  children: React.ReactNode;
}

function navFromPath(pathname: string): StudioNavId {
  if (pathname.startsWith("/profile")) {
    return "profile";
  }
  if (pathname.startsWith("/upload")) {
    return "upload";
  }
  if (pathname.startsWith("/releases")) {
    return "releases";
  }
  return "home";
}

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 80;

const StudioAppShell: React.FC<StudioAppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const session = useStudioSession();
  const myProfile = useQuery(api.studio.getMyProfile, {});
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const [desktopExpanded, setDesktopExpanded] = useLocalStorage({
    key: "kindred-studio-sidebar-expanded",
    defaultValue: true,
  });
  const isDesktop = useMediaQuery("(min-width: 62em)");

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useHotkeys([["Escape", closeMobile]]);

  const navbarWidth = desktopExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const sidebarExpanded = isDesktop ? desktopExpanded : true;

  return (
    <AppShell
      layout="alt"
      header={{ height: { base: 56, md: 0 } }}
      navbar={{
        width: { base: EXPANDED_WIDTH, md: navbarWidth },
        breakpoint: "md",
        collapsed: { mobile: !mobileOpened },
      }}
      padding={0}
      withBorder={false}
      transitionDuration={200}
      transitionTimingFunction="ease"
      // Mantine sets navbar width to 100% below the breakpoint; keep a drawer strip.
      className="max-md:![--app-shell-navbar-width:min(260px,85vw)]"
    >
      <AppShell.Header
        hiddenFrom="md"
        withBorder={false}
        className="flex items-center border-b border-white/5 bg-surface px-4"
      >
        <Group gap="sm" wrap="nowrap" h="100%">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            size="sm"
            color="#EEEEEE"
            aria-label={mobileOpened ? "Close navigation" : "Open navigation"}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASSETS.icons.logo}
            alt="Kindred"
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg"
          />
          <span className="font-display text-base text-text">
            Artist Studio
          </span>
        </Group>
      </AppShell.Header>

      {mobileOpened ? (
        <Overlay
          fixed
          hiddenFrom="md"
          zIndex={190}
          backgroundOpacity={0.55}
          color="#000"
          onClick={closeMobile}
          aria-hidden
        />
      ) : null}

      <AppShell.Navbar
        p={0}
        withBorder={false}
        zIndex={200}
        className="border-r border-white/5 bg-surface"
      >
        <StudioSidebar
          displayName={myProfile?.name ?? session.displayName}
          isAdmin={session.isAdmin}
          avatarUrl={myProfile?.avatarUrl ?? null}
          expanded={sidebarExpanded}
          onToggleExpanded={() => setDesktopExpanded((value) => !value)}
          onSignOut={session.handleSignOut}
          isSigningOut={session.isSigningOut}
          activeNav={navFromPath(pathname)}
          onNavigate={closeMobile}
          onCloseMobile={closeMobile}
        />
      </AppShell.Navbar>

      <AppShell.Main className="min-h-screen bg-page">{children}</AppShell.Main>
    </AppShell>
  );
};

export default StudioAppShell;
