import { cleanup, screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import { useGetAppPrompt } from "./getAppPromptStore";
import GetTheAppButton from "./GetTheAppButton";
import PublicGetAppModal from "./PublicGetAppModal";

describe("PublicGetAppModal", () => {
  afterEach(() => {
    cleanup();
    useGetAppPrompt.setState({ open: false });
  });

  it("opens over the current page and closes in place", async () => {
    const user = setupUser();
    render(
      <>
        <p>Browse stays</p>
        <GetTheAppButton className="rounded-xl bg-primary px-4 py-2" />
        <PublicGetAppModal />
      </>
    );

    await user.click(screen.getByRole("button", { name: /^get the app$/i }));
    expect(
      screen.getByRole("dialog", { name: /listen with the full kindred app/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Browse stays")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /^continue in browser$/i })
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Browse stays")).toBeInTheDocument();
  });
});
