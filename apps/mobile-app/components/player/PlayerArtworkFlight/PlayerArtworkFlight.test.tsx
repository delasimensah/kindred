import { render, screen } from "@testing-library/react-native";
import { useSharedValue } from "react-native-reanimated";

import PlayerArtworkFlight from "./PlayerArtworkFlight";

const Flight = () => {
  const progress = useSharedValue(0.5);
  return (
    <PlayerArtworkFlight
      progress={progress}
      artworkUrl="https://example.com/cover.jpg"
      heroHeight={400}
      collapsed={{ left: 24, top: 700, size: 40 }}
    />
  );
};

describe("PlayerArtworkFlight", () => {
  it("carries the album artwork between the bar and the player", () => {
    render(<Flight />);
    expect(screen.getByLabelText("Moving album artwork")).toBeTruthy();
  });
});
