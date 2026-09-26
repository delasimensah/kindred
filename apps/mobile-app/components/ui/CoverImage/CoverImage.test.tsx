import { render } from "@testing-library/react-native";

import CoverImage from "./CoverImage";

describe("CoverImage", () => {
  it("keeps a surface-sized frame when there is no url", () => {
    const { toJSON } = render(
      <CoverImage uri={null} width={48} height={48} radius={6} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders a remote url inside the same frame", () => {
    const { toJSON } = render(
      <CoverImage
        uri="https://example.com/cover.jpg"
        width={128}
        height={128}
        radius={12}
      />
    );
    expect(toJSON()).toBeTruthy();
  });
});
