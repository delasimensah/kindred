import { fireEvent, render, screen } from "@testing-library/react-native";

import ExpandablePhoto from "./ExpandablePhoto";

describe("ExpandablePhoto", () => {
  it("opens the photo and closes it again", () => {
    render(
      <ExpandablePhoto
        uri="https://example.com/session.jpg"
        label="Photo from Amaara Mensah"
      />
    );
    fireEvent.press(screen.getByLabelText("Photo from Amaara Mensah"));
    expect(screen.getByLabelText("Close photo")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Close photo"));
    expect(screen.queryByLabelText("Close photo")).toBeNull();
  });
});
