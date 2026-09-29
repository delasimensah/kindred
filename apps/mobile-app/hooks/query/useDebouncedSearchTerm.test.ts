import { act, renderHook } from "@testing-library/react-native";

import {
  normalizeSearchTerm,
  SEARCH_DEBOUNCE_MS,
  useDebouncedSearchTerm,
} from "./useDebouncedSearchTerm";

describe("normalizeSearchTerm", () => {
  it("drops a query that is too short or has no letters", () => {
    expect(normalizeSearchTerm(" a ")).toBeNull();
    expect(normalizeSearchTerm("!!")).toBeNull();
    expect(normalizeSearchTerm("  amaara  ")).toBe("amaara");
  });
});

describe("useDebouncedSearchTerm", () => {
  it("subscribes only after typing pauses, and clears a short query immediately", () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ raw }: { raw: string }) => useDebouncedSearchTerm(raw),
      { initialProps: { raw: "" } }
    );

    rerender({ raw: "a" });
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    expect(result.current).toBeNull();

    rerender({ raw: "am" });
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    });
    expect(result.current).toBeNull();
    rerender({ raw: "ama" });
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    });
    expect(result.current).toBeNull();
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("ama");

    rerender({ raw: "a" });
    act(() => {
      jest.advanceTimersByTime(0);
    });
    expect(result.current).toBeNull();
    jest.useRealTimers();
  });
});
