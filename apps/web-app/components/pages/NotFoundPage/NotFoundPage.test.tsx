import { screen } from "@testing-library/react";

import { render } from "@/test-utils";

import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("offers the public site and artist studio", () => {
    render(<NotFoundPage />);

    expect(
      screen.getByRole("heading", { name: /this page isn't here/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /browse kindred/i })
    ).toHaveAttribute("href", "/browse");
    expect(
      screen.getByRole("link", { name: /artist studio/i })
    ).toHaveAttribute("href", "/sign-in");
  });
});
