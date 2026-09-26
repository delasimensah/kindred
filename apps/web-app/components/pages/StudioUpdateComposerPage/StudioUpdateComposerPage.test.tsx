import { screen } from "@testing-library/react";
import React from "react";

import { fillField, render, setupUser } from "@/test-utils";

import StudioUpdateComposerPage from "./StudioUpdateComposerPage";

const mockUseQuery = jest.fn();
const mockMutation = jest.fn();
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: () => mockMutation,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  return {
    ...actual,
    showErrorNotification: jest.fn(),
    showSuccessNotification: jest.fn(),
  };
});

describe("StudioUpdateComposerPage", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockMutation.mockReset();
    mockPush.mockReset();
    mockSearchParams.delete("postId");
    mockUseQuery.mockImplementation((_query: unknown, args: unknown) => {
      if (args === "skip") {
        return undefined;
      }
      return {
        artistId: "artists_1",
        name: "Amaara Mensah",
        handle: "amaara",
        bio: "Highlife",
        avatarUrl: null,
        coverUrl: null,
        verified: true,
        hidden: false,
      };
    });
    mockMutation.mockResolvedValue("posts_1");
  });

  it("posts text with Everyone audience", async () => {
    const user = setupUser();
    render(<StudioUpdateComposerPage />);

    await fillField(
      user,
      screen.getByRole("textbox", { name: /what's on your mind/i }),
      "Back in the studio this week."
    );
    await user.click(screen.getByRole("button", { name: /post update/i }));

    expect(mockMutation).toHaveBeenCalledWith({
      body: "Back in the studio this week.",
      audience: "everyone",
    });
    expect(mockPush).toHaveBeenCalledWith("/updates");
  });
});
