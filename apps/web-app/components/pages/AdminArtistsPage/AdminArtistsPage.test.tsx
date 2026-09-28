import { screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import AdminArtistsPage from "./AdminArtistsPage";

describe("AdminArtistsPage", () => {
  it("unverifies a verified artist", async () => {
    const user = setupUser();
    const onSetVerified = jest.fn();
    render(
      <AdminArtistsPage
        artists={[
          {
            artistId: "artist_1",
            name: "Amaara Mensah",
            handle: "amaara",
            verified: true,
            supporterCount: 12,
            createdAt: Date.UTC(2023, 2, 1),
            avatarUrl: null,
          },
        ]}
        busyId={null}
        onSetVerified={onSetVerified}
      />
    );

    expect(screen.getByText("12 supporters")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /unverify/i }));
    expect(onSetVerified).toHaveBeenCalledWith("artist_1", false);
  });
});
