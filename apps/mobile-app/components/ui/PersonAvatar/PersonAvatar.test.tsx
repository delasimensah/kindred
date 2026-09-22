import { render, screen } from "@testing-library/react-native";

import PersonAvatar from "./PersonAvatar";

describe("PersonAvatar", () => {
  it("shows initials from the display name", () => {
    render(<PersonAvatar displayName="Yaw Darko" />);

    expect(screen.getByText("YD")).toBeTruthy();
    expect(screen.getByLabelText("Yaw Darko")).toBeTruthy();
  });

  it("shows a portrait when an image url is passed", () => {
    render(
      <PersonAvatar
        displayName="Amaara Mensah"
        imageUrl="https://example.com/amaara.jpg"
      />
    );

    expect(screen.getByLabelText("Amaara Mensah")).toBeTruthy();
    expect(screen.queryByText("AM")).toBeNull();
  });
});
