import { cleanup, screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import PublicGetAppPage from "./PublicGetAppPage";

const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe("PublicGetAppPage", () => {
  afterEach(() => {
    cleanup();
    mockBack.mockReset();
  });

  it("shows the install card and returns to the previous page", async () => {
    const user = setupUser();
    render(<PublicGetAppPage />);

    expect(
      screen.getByRole("heading", { name: /listen with the full kindred app/i })
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /open app/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /app store/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /google play/i })).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: /^continue in browser$/i })
    );
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
