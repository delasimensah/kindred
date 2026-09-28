import { fireEvent, render, screen } from "@testing-library/react-native";

import ArtistRequestScreen from "./ArtistRequestScreen";

const filled = {
  displayName: "Efua Boateng",
  bio: "Afro-soul from Accra.",
  note: "I want a home for these songs.",
  declineReason: null,
  createdAt: Date.now(),
  submitting: false,
};

describe("ArtistRequestScreen", () => {
  it("submits a display name, bio, and why", () => {
    const onSubmit = jest.fn();
    render(
      <ArtistRequestScreen status="none" {...filled} onSubmit={onSubmit} />
    );

    fireEvent.press(screen.getByText("Submit request"));
    expect(onSubmit).toHaveBeenCalledWith({
      displayName: filled.displayName,
      bio: filled.bio,
      note: filled.note,
    });
  });

  it("shows the sent answers while review is pending", () => {
    render(
      <ArtistRequestScreen status="pending" {...filled} onSubmit={jest.fn()} />
    );

    expect(screen.getByText("Request pending review")).toBeTruthy();
    expect(screen.getByText("Here's what you sent.")).toBeTruthy();
    expect(screen.getByText(filled.displayName)).toBeTruthy();
    expect(screen.getByText(filled.bio)).toBeTruthy();
    expect(screen.getByText(filled.note)).toBeTruthy();
    expect(screen.queryByText("Submit request")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("lets a declined fan send a new request", () => {
    const onSubmit = jest.fn();
    render(
      <ArtistRequestScreen
        status="declined"
        {...filled}
        declineReason="Need a public link"
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText("Need a public link")).toBeTruthy();
    fireEvent.changeText(
      screen.getByLabelText("Why do you want to join as an artist?"),
      "The songs are on my site."
    );
    fireEvent.press(screen.getByText("Submit request"));
    expect(onSubmit).toHaveBeenCalledWith({
      displayName: filled.displayName,
      bio: filled.bio,
      note: "The songs are on my site.",
    });
  });

  it("hides the form after approval", () => {
    render(
      <ArtistRequestScreen status="approved" {...filled} onSubmit={jest.fn()} />
    );

    expect(screen.getByText("You're an artist")).toBeTruthy();
    expect(screen.queryByText(filled.bio)).toBeNull();
    expect(screen.queryByText("Submit request")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
