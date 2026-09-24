import { fireEvent, render, screen } from "@testing-library/react-native";

import FeedUpdateCard from "./FeedUpdateCard";

describe("FeedUpdateCard", () => {
  it("shows a public note, a voice chip, and a locked shell", () => {
    const onSupport = jest.fn();
    const onToggleVoice = jest.fn();
    const { rerender } = render(
      <FeedUpdateCard
        artistName="Sela Okoro"
        avatarUrl={null}
        meta="Yesterday · Voice note"
        body="The log drum finally sat in the pocket."
        locked={false}
        voiceDurationMs={42_000}
        canPlayVoice
        voicePlaying={false}
        onOpenArtist={jest.fn()}
        onSupport={onSupport}
        onToggleVoice={onToggleVoice}
      />
    );
    expect(
      screen.getByText("The log drum finally sat in the pocket.")
    ).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Play voice note"));
    expect(onToggleVoice).toHaveBeenCalledTimes(1);

    rerender(
      <FeedUpdateCard
        artistName="Kweku Darko"
        avatarUrl={null}
        meta="5h ago · Supporters only"
        body={null}
        locked
        voiceDurationMs={null}
        canPlayVoice={false}
        voicePlaying={false}
        onOpenArtist={jest.fn()}
        onSupport={onSupport}
        onToggleVoice={onToggleVoice}
      />
    );
    fireEvent.press(screen.getByLabelText("Support Kweku Darko to unlock"));
    expect(onSupport).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("The log drum finally sat in the pocket.")
    ).toBeNull();
  });
});
