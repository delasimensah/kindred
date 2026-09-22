import { fireEvent, render, screen } from "@testing-library/react-native";

import OnboardingFollowArtistsScreen from "./OnboardingFollowArtistsScreen";

const artists = [
  {
    artistId: "1",
    name: "Amaara Mensah",
    bio: "Afro-soul and R&B · Accra",
    avatarUrl: null,
    isFollowed: false,
  },
  {
    artistId: "2",
    name: "Kweku Darko",
    bio: "Highlife · Kumasi",
    avatarUrl: null,
    isFollowed: false,
  },
];

describe("OnboardingFollowArtistsScreen", () => {
  it("keeps Continue disabled until two follows", () => {
    const onContinue = jest.fn();
    render(
      <OnboardingFollowArtistsScreen
        artists={artists}
        followCount={1}
        isSaving={false}
        onBack={jest.fn()}
        onToggleFollow={jest.fn()}
        onContinue={onContinue}
      />
    );
    fireEvent.press(screen.getByText("Continue"));
    expect(onContinue).not.toHaveBeenCalled();
  });
});
