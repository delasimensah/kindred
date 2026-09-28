import { cleanup, screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import PublicLoadFailed from "./PublicLoadFailed";

describe("PublicLoadFailed", () => {
  afterEach(() => {
    cleanup();
  });

  it("asks to try the page again", async () => {
    const user = setupUser();
    const onRetry = jest.fn();
    render(<PublicLoadFailed onRetry={onRetry} />);

    expect(
      screen.getByRole("heading", { name: /couldn't load this page/i })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
