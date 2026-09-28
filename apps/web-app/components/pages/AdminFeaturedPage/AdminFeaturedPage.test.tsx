import { screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import AdminFeaturedPage from "./AdminFeaturedPage";

const yaw = {
  artistId: "artist_yaw",
  name: "Yaw Darko",
  handle: "yaw-darko",
  bio: "Highlife from Accra.",
  avatarUrl: null,
  live: true,
};

const amaara = {
  artistId: "artist_amaara",
  name: "Amaara Mensah",
  handle: "amaara",
  bio: "Highlife from Accra.",
  avatarUrl: null,
  live: true,
};

describe("AdminFeaturedPage", () => {
  it("reorders a slot and saves", async () => {
    const user = setupUser();
    const onMove = jest.fn();
    const onSave = jest.fn();
    render(
      <AdminFeaturedPage
        slots={[yaw, amaara]}
        artists={[]}
        dirty
        saving={false}
        onMove={onMove}
        onRemove={jest.fn()}
        onAdd={jest.fn()}
        onSave={onSave}
      />
    );

    expect(screen.getByText("2 of 6 slots filled")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /move yaw darko later/i })
    );
    expect(onMove).toHaveBeenCalledWith(0, 1);
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    expect(onSave).toHaveBeenCalled();
  });

  it("adds an artist into the next slot", async () => {
    const user = setupUser();
    const onAdd = jest.fn();
    render(
      <AdminFeaturedPage
        slots={[yaw]}
        artists={[
          {
            artistId: amaara.artistId,
            name: amaara.name,
            handle: amaara.handle,
            bio: amaara.bio,
            avatarUrl: null,
          },
        ]}
        dirty={false}
        saving={false}
        onMove={jest.fn()}
        onRemove={jest.fn()}
        onAdd={onAdd}
        onSave={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /^add$/i }));
    await user.click(screen.getByRole("button", { name: /amaara mensah/i }));
    expect(onAdd).toHaveBeenCalledWith(amaara.artistId);
  });
});
