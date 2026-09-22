import { render, screen } from "@testing-library/react-native";

import AuthWordmark from "./AuthWordmark";

describe("AuthWordmark", () => {
  it("shows the Kindred mark", () => {
    render(<AuthWordmark />);
    expect(screen.getByLabelText("Kindred mark")).toBeTruthy();
    expect(screen.queryByText("Kindred")).toBeNull();
  });
});
