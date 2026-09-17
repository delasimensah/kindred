import { screen } from "@testing-library/react";

import { render } from "@/test-utils";

import LoadingScreen from "./LoadingScreen";

describe("LoadingScreen Component", () => {
  it("shows Kindred on the splash, not the word Loading", () => {
    render(<LoadingScreen />);

    expect(screen.getByRole("heading", { name: "Kindred" })).toBeTruthy();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
