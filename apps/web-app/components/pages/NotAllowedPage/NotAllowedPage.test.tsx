import { screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import NotAllowedPage from "./NotAllowedPage";

describe("NotAllowedPage", () => {
  it("explains fan refusal and signs out", async () => {
    const user = setupUser();
    const onSignOut = jest.fn();
    render(<NotAllowedPage onSignOut={onSignOut} />);

    expect(
      screen.getByRole("heading", {
        name: /this account cannot use artist studio/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/fan accounts stay on the kindred mobile app/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(onSignOut).toHaveBeenCalled();
  });
});
