import { fireEvent, screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import PublicPlayerBar from "./PublicPlayerBar";

describe("PublicPlayerBar", () => {
  it("pauses, seeks, and moves to the next and previous track", async () => {
    const user = setupUser();
    const onToggle = jest.fn();
    const onPrevious = jest.fn();
    const onNext = jest.fn();
    const onSeek = jest.fn();
    render(
      <PublicPlayerBar
        title="Asase"
        artistName="Amaara Mensah"
        artworkUrl={null}
        positionMs={1000}
        durationMs={180000}
        playing
        canNext
        onToggle={onToggle}
        onPrevious={onPrevious}
        onNext={onNext}
        onSeek={onSeek}
      />
    );

    await user.click(screen.getByRole("button", { name: /^pause$/i }));
    await user.click(screen.getByRole("button", { name: /previous track/i }));
    await user.click(screen.getByRole("button", { name: /next track/i }));
    fireEvent.change(screen.getByRole("slider", { name: /seek/i }), {
      target: { value: "4000" },
    });
    expect(onToggle).toHaveBeenCalled();
    expect(onPrevious).toHaveBeenCalled();
    expect(onNext).toHaveBeenCalled();
    expect(onSeek).toHaveBeenCalledWith(4000);
  });
});
