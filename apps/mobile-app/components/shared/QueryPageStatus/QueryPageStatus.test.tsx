import { render, screen } from "@testing-library/react-native";

import QueryPageStatus from "./QueryPageStatus";

describe("QueryPageStatus", () => {
  it("shows the default skeleton while loading", () => {
    render(
      <QueryPageStatus
        loadState="loading"
        failedTitle="Couldn't load this page."
      >
        Home
      </QueryPageStatus>
    );

    expect(screen.getByLabelText("Loading page")).toBeTruthy();
    expect(screen.queryByText("Home")).toBeNull();
  });
});
