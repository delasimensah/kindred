import { screen } from "@testing-library/react";

import { ASSETS } from "@/constants";
import { render } from "@/test-utils";

import LoadingScreen from "./LoadingScreen";

describe("LoadingScreen Component", () => {
  it("shows the Kindred logo on the splash, not the word Loading", () => {
    render(<LoadingScreen />);

    const logo = screen.getByRole("img", { name: "Kindred" });
    expect(logo).toHaveAttribute("src", ASSETS.icons.logo);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
