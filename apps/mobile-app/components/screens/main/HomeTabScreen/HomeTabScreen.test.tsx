import { fireEvent, render, screen } from "@testing-library/react-native";

import HomeTabScreen, { type HomeFeedPost } from "./HomeTabScreen";

const now = Date.UTC(2026, 8, 24, 12, 0, 0);

const voice: HomeFeedPost = {
  kind: "post",
  id: "post_voice",
  artistId: "artist_sela",
  artistName: "Sela Okoro",
  avatarUrl: null,
  createdAt: now - 24 * 60 * 60 * 1000,
  audience: "everyone",
  body: "The log drum finally sat in the pocket.",
  locked: false,
  photoUrl: null,
  voiceDurationMs: 42_000,
  voiceUrl: "https://example.com/voice.mp3",
  voicePeaks: [0.4, 0.8],
};

describe("HomeTabScreen", () => {
  it("opens account and shows an empty feed", () => {
    const onOpenAccount = jest.fn();
    render(
      <HomeTabScreen
        displayName="Efua Boateng"
        items={[]}
        isLoading={false}
        now={now}
        playingTrackId={null}
        playingVoiceUrl={null}
        voiceActiveUrl={null}
        voiceProgress={0}
        onOpenAccount={onOpenAccount}
        onOpenArtist={jest.fn()}
        onPlayTrack={jest.fn()}
        onToggleVoice={jest.fn()}
        onSeekVoice={jest.fn()}
        onSupport={jest.fn()}
      />
    );
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("No updates yet")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Account"));
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
  });

  it("shows the update-card skeleton while the feed is loading", () => {
    render(
      <HomeTabScreen
        displayName="Efua Boateng"
        items={[]}
        isLoading
        now={now}
        playingTrackId={null}
        playingVoiceUrl={null}
        voiceActiveUrl={null}
        voiceProgress={0}
        onOpenAccount={jest.fn()}
        onOpenArtist={jest.fn()}
        onPlayTrack={jest.fn()}
        onToggleVoice={jest.fn()}
        onSeekVoice={jest.fn()}
        onSupport={jest.fn()}
      />
    );
    expect(screen.getByTestId("home-feed-skeleton")).toBeTruthy();
    expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(12);
  });

  it("plays a seeded voice note and offers support on a locked post", () => {
    const onToggleVoice = jest.fn();
    const onSupport = jest.fn();
    render(
      <HomeTabScreen
        displayName="Efua Boateng"
        items={[
          voice,
          {
            kind: "post",
            id: "post_locked",
            artistId: "artist_kweku",
            artistName: "Kweku Darko",
            avatarUrl: null,
            createdAt: now - 5 * 60 * 60 * 1000,
            audience: "supporters",
            body: null,
            locked: true,
            photoUrl: null,
            voiceDurationMs: null,
            voiceUrl: null,
            voicePeaks: [],
          },
        ]}
        isLoading={false}
        now={now}
        playingTrackId={null}
        playingVoiceUrl={null}
        voiceActiveUrl={null}
        voiceProgress={0}
        onOpenAccount={jest.fn()}
        onOpenArtist={jest.fn()}
        onPlayTrack={jest.fn()}
        onToggleVoice={onToggleVoice}
        onSeekVoice={jest.fn()}
        onSupport={onSupport}
      />
    );
    expect(screen.getByText("0:42")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Play voice note"));
    expect(onToggleVoice).toHaveBeenCalledWith("https://example.com/voice.mp3");
    fireEvent.press(screen.getByLabelText("Support Kweku Darko to unlock"));
    expect(onSupport).toHaveBeenCalledWith("Kweku Darko");
  });
});
