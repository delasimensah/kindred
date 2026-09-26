"use client";

import { ActionIcon, Anchor, Box, Button, Tooltip } from "@mantine/core";
import {
  type Icon,
  IconCash,
  IconChevronLeft,
  IconChevronRight,
  IconCloudUpload,
  IconDisc,
  IconHandClick,
  IconHeart,
  IconHome,
  IconLogout,
  IconSpeakerphone,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { cn } from "shared";

import { ASSETS } from "@/constants";

import Text from "../../ui/Text/Text";

export type StudioNavId =
  | "home"
  | "releases"
  | "upload"
  | "updates"
  | "supporters"
  | "thankYous"
  | "earnings"
  | "profile";

interface StudioSidebarProps {
  displayName: string;
  isAdmin: boolean;
  avatarUrl: string | null;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSignOut: () => void;
  isSigningOut?: boolean;
  activeNav?: StudioNavId;
  onNavigate?: () => void;
  onCloseMobile?: () => void;
}

const NAV_ITEMS: {
  id: StudioNavId;
  href: string | null;
  label: string;
  Icon: Icon;
  ready: boolean;
}[] = [
  { id: "home", href: "/", label: "Home", Icon: IconHome, ready: true },
  {
    id: "releases",
    href: "/releases",
    label: "Releases",
    Icon: IconDisc,
    ready: true,
  },
  {
    id: "upload",
    href: "/upload",
    label: "Upload",
    Icon: IconCloudUpload,
    ready: true,
  },
  {
    id: "updates",
    href: null,
    label: "Updates",
    Icon: IconSpeakerphone,
    ready: false,
  },
  {
    id: "supporters",
    href: null,
    label: "Supporters",
    Icon: IconHeart,
    ready: false,
  },
  {
    id: "thankYous",
    href: null,
    label: "Thank-yous",
    Icon: IconHandClick,
    ready: false,
  },
  {
    id: "earnings",
    href: null,
    label: "Earnings",
    Icon: IconCash,
    ready: false,
  },
  {
    id: "profile",
    href: "/profile",
    label: "Profile",
    Icon: IconUser,
    ready: true,
  },
];

const StudioSidebar: React.FC<StudioSidebarProps> = ({
  displayName,
  isAdmin,
  avatarUrl,
  expanded,
  onToggleExpanded,
  onSignOut,
  isSigningOut = false,
  activeNav = "home",
  onNavigate,
  onCloseMobile,
}) => {
  return (
    <Box className="flex h-full w-full flex-col bg-surface">
      <Box
        className={cn(
          "flex items-center pb-6 pt-8",
          expanded ? "justify-between gap-3 px-5" : "flex-col gap-3 px-3"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            expanded ? "" : "justify-center"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASSETS.icons.logo}
            alt="Kindred"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-lg"
          />
          {expanded ? (
            <span className="font-display text-xl tracking-tight text-text">
              Kindred
            </span>
          ) : null}
        </div>
        <ActionIcon
          hiddenFrom="md"
          variant="subtle"
          size="sm"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="text-text/50 hover:bg-white/5 hover:text-text"
        >
          <IconX size={18} />
        </ActionIcon>
        <Tooltip
          label={expanded ? "Minimize sidebar" : "Expand sidebar"}
          position="right"
        >
          <ActionIcon
            visibleFrom="md"
            variant="subtle"
            size="sm"
            aria-label={expanded ? "Minimize sidebar" : "Expand sidebar"}
            onClick={onToggleExpanded}
            className="text-text/50 hover:bg-white/5 hover:text-text"
          >
            {expanded ? (
              <IconChevronLeft size={16} />
            ) : (
              <IconChevronRight size={16} />
            )}
          </ActionIcon>
        </Tooltip>
      </Box>

      <Box
        component="nav"
        className={cn("flex-1 space-y-1", expanded ? "px-4" : "px-2")}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeNav;
          const icon = (
            <item.Icon
              size={18}
              stroke={1.75}
              className="shrink-0"
              aria-hidden
            />
          );
          const className = cn(
            "flex items-center rounded-lg text-sm font-medium no-underline transition",
            expanded ? "gap-3 px-3.5 py-2.5" : "justify-center px-2 py-2.5",
            isActive
              ? "bg-primary/10 text-primary"
              : item.ready
                ? "text-text/60 hover:bg-white/5 hover:text-text"
                : "cursor-not-allowed text-text/30"
          );

          if (!item.ready || item.href === null) {
            const disabled = (
              <span className={className} aria-disabled>
                {icon}
                {expanded ? <span>{item.label}</span> : null}
              </span>
            );
            return (
              <Tooltip
                key={item.id}
                label={`${item.label} — coming soon`}
                position="right"
              >
                {disabled}
              </Tooltip>
            );
          }

          const link = (
            <Anchor
              key={item.id}
              component={Link}
              href={item.href}
              underline="never"
              onClick={onNavigate}
              className={className}
              aria-current={isActive ? "page" : undefined}
            >
              {icon}
              {expanded ? <span>{item.label}</span> : null}
            </Anchor>
          );

          if (!expanded) {
            return (
              <Tooltip key={item.id} label={item.label} position="right">
                {link}
              </Tooltip>
            );
          }
          return link;
        })}
      </Box>

      <Box
        className={cn(
          "border-t border-white/5 py-5",
          expanded ? "px-5" : "px-2"
        )}
      >
        <div
          className={cn(
            "mb-3 flex items-center gap-3",
            expanded ? "" : "justify-center"
          )}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {displayName.slice(0, 1).toUpperCase() || "K"}
            </div>
          )}
          {expanded ? (
            <div className="min-w-0">
              <Text className="truncate text-sm font-medium text-text">
                {displayName || "Artist"}
              </Text>
              <Text className="truncate text-xs text-text/45">
                {isAdmin ? "Admin" : "Artist"}
              </Text>
            </div>
          ) : null}
        </div>
        {expanded ? (
          <Button
            variant="subtle"
            fullWidth
            loading={isSigningOut}
            onClick={onSignOut}
            leftSection={<IconLogout size={16} />}
            className="justify-start text-text/60 hover:bg-white/5 hover:text-text"
          >
            Sign out
          </Button>
        ) : (
          <Tooltip label="Sign out" position="right">
            <ActionIcon
              variant="subtle"
              aria-label="Sign out"
              loading={isSigningOut}
              onClick={onSignOut}
              className="mx-auto text-text/60 hover:bg-white/5 hover:text-text"
            >
              <IconLogout size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default StudioSidebar;
