import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { render, screen } from "@testing-library/react-native";

import { PreviewPlayerProvider } from "@/hooks";

import QueuePanel from "./QueuePanel";

describe("QueuePanel", () => {
  it("shows the current track and the upcoming section", () => {
    render(
      <PreviewPlayerProvider>
        <BottomSheetModalProvider>
          <QueuePanel />
        </BottomSheetModalProvider>
      </PreviewPlayerProvider>
    );
    expect(screen.getByText("Next up")).toBeTruthy();
    expect(screen.getByText("Asase")).toBeTruthy();
  });
});
