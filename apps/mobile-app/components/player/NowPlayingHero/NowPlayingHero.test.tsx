import { fireEvent, render, screen } from "@testing-library/react-native";

import NowPlayingHero from "./NowPlayingHero";

describe("NowPlayingHero", () => {
  it("closes the player", () => {
    const onClose = jest.fn();
    render(
      <NowPlayingHero
        title="Asase"
        artistName="Amaara Mensah"
        trackId="tr_asase"
        artworkUrl={null}
        height={200}
        paddingTop={16}
        visualizer={false}
        canLike={false}
        liked={false}
        onClose={onClose}
        onPlayNext={jest.fn()}
        onAddToQueue={jest.fn()}
        onToggleLike={jest.fn()}
      />
    );
    fireEvent.press(screen.getByLabelText("Close player"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
