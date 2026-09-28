import { cleanup, screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import type { PublicPost } from "./PublicPostPage";
import PublicPostPage from "./PublicPostPage";

const openPost: PublicPost = {
  postId: "post_open",
  artistName: "Amaara Mensah",
  artistHandle: "amaara",
  avatarUrl: null,
  createdAt: Date.now(),
  locked: false,
  body: "Asase is finished.",
  photoUrl: null,
  hasVoice: true,
  voiceDurationMs: 42000,
};

const lockedPost: PublicPost = {
  ...openPost,
  postId: "post_locked",
  locked: true,
  body: null,
  hasVoice: false,
  voiceDurationMs: null,
};

describe("PublicPostPage", () => {
  it("shows a public update and locks an exclusive without its words", async () => {
    const user = setupUser();
    const onPlayVoice = jest.fn();
    render(
      <PublicPostPage
        post={openPost}
        voicePlaying={false}
        onPlayVoice={onPlayVoice}
      />
    );
    expect(screen.getByText("Asase is finished.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /play voice note/i }));
    expect(onPlayVoice).toHaveBeenCalled();

    cleanup();
    render(
      <PublicPostPage
        post={lockedPost}
        voicePlaying={false}
        onPlayVoice={jest.fn()}
      />
    );
    expect(screen.queryByText("Asase is finished.")).toBeNull();
    expect(screen.queryByRole("button", { name: /voice note/i })).toBeNull();
    expect(
      screen.getByRole("button", { name: /^get the app$/i })
    ).toBeInTheDocument();
  });
});
