import { render, screen } from "@testing-library/react-native";

import LiveListenerChip from "./LiveListenerChip";

describe("LiveListenerChip", () => {
  it("shows the approximate count, never a name list", () => {
    render(<LiveListenerChip count={128} />);
    expect(screen.getByLabelText("128 listening now")).toBeTruthy();
    expect(screen.queryByText(/amaara|mensah|listener name/i)).toBeNull();
  });
});
