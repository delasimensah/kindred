import { screen } from "@testing-library/react";
import React from "react";

import { render, setupUser } from "@/test-utils";

import StudioSidebar from "./StudioSidebar";

function MockLink({
  children,
  href,
  ...props
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

jest.mock("next/link", () => MockLink);

describe("StudioSidebar", () => {
  it("shows nav icons and labels when expanded", () => {
    render(
      <StudioSidebar
        displayName="Amaara"
        isAdmin={false}
        avatarUrl={null}
        expanded
        onToggleExpanded={jest.fn()}
        onSignOut={jest.fn()}
        activeNav="home"
      />
    );

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /releases/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /upload/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /updates/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /requests/i })).toBeNull();
  });

  it("shows the admin queue when this person is an admin", () => {
    render(
      <StudioSidebar
        displayName="Delasi"
        isAdmin
        showStudioNav={false}
        showAdminNav
        pendingCount={2}
        avatarUrl={null}
        expanded
        onToggleExpanded={jest.fn()}
        onSignOut={jest.fn()}
        activeNav="requests"
      />
    );

    expect(screen.getByRole("link", { name: /requests/i })).toHaveAttribute(
      "href",
      "/admin/requests"
    );
    expect(screen.getByRole("link", { name: /artists/i })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /upload/i })).toBeNull();
  });

  it("signs out from the footer", async () => {
    const user = setupUser();
    const onSignOut = jest.fn();
    render(
      <StudioSidebar
        displayName="Amaara"
        isAdmin={false}
        avatarUrl={null}
        expanded
        onToggleExpanded={jest.fn()}
        onSignOut={onSignOut}
      />
    );

    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(onSignOut).toHaveBeenCalled();
  });
});
