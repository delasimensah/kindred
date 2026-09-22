import { useAuthActions } from "@convex-dev/auth/react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useMutation, useQuery } from "convex/react";

import { FanSessionProvider, useFanSession } from "../useFanSession";

const mockSignOut = jest.fn();
const mockEnsure = jest.fn();

jest.mock("@convex-dev/auth/react", () => ({
  useAuthActions: jest.fn(),
  useConvexAuth: jest.fn(),
}));

jest.mock("convex/react", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));

describe("useFanSession", () => {
  beforeEach(() => {
    mockSignOut.mockReset();
    mockEnsure.mockReset();
    mockEnsure.mockResolvedValue("profile-1");
    (useAuthActions as jest.Mock).mockReturnValue({ signOut: mockSignOut });
    (useMutation as jest.Mock).mockReturnValue(mockEnsure);
    (useQuery as jest.Mock).mockReturnValue({
      displayName: "Efua Boateng",
    });
  });

  it("exposes the fan after the profile is ready", async () => {
    const { useConvexAuth } = require("@convex-dev/auth/react") as {
      useConvexAuth: jest.Mock;
    };
    useConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const { result } = renderHook(() => useFanSession(), {
      wrapper: FanSessionProvider,
    });

    await waitFor(() => {
      expect(result.current.displayName).toBe("Efua Boateng");
      expect(result.current.isViewerReady).toBe(true);
      expect(result.current.isSessionLoading).toBe(false);
    });
  });

  it("treats Convex auth restore as session loading", () => {
    const { useConvexAuth } = require("@convex-dev/auth/react") as {
      useConvexAuth: jest.Mock;
    };
    useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const { result } = renderHook(() => useFanSession(), {
      wrapper: FanSessionProvider,
    });

    expect(result.current.isSessionLoading).toBe(true);
  });
});
