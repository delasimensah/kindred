import { cleanup, screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import PublicGetAppPage from "./PublicGetAppPage";

describe("PublicGetAppPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the install card and closes in place", async () => {
    const user = setupUser();
    const onClose = jest.fn();
    render(<PublicGetAppPage onClose={onClose} />);

    expect(
      screen.getByRole("heading", { name: /listen with the full kindred app/i })
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /open app/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /app store/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /google play/i })).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: /^continue in browser$/i })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
