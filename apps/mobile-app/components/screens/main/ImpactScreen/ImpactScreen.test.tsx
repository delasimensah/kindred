import { fireEvent, render, screen } from "@testing-library/react-native";

import ImpactScreen from "./ImpactScreen";

const artists = [
  {
    artistId: "amaara",
    name: "Amaara Mensah",
    avatarUrl: null,
    founding: true,
    inRoute: true,
    sharePercent: 33,
    amountCents: 333,
    sinceCents: 999,
  },
  {
    artistId: "kweku",
    name: "Kweku Darko",
    avatarUrl: null,
    founding: false,
    inRoute: true,
    sharePercent: 33,
    amountCents: 333,
    sinceCents: 666,
  },
  {
    artistId: "tewa",
    name: "Téwá Nkrumah",
    avatarUrl: null,
    founding: true,
    inRoute: false,
    sharePercent: 0,
    amountCents: 0,
    sinceCents: 498,
  },
];

describe("ImpactScreen", () => {
  it("shows this month's equal split and the founding badge", () => {
    const onManageRouting = jest.fn();
    render(
      <ImpactScreen
        isLoading={false}
        entitled
        totalCents={999}
        sinceCents={2163}
        artists={artists}
        onManageRouting={onManageRouting}
      />
    );

    expect(screen.getByText("This month only")).toBeTruthy();
    expect(screen.getByText("$9.99")).toBeTruthy();
    expect(screen.getByText("Since you started $21.63")).toBeTruthy();
    expect(screen.getByText("Amaara Mensah")).toBeTruthy();
    expect(screen.getByText("Since you started $9.99")).toBeTruthy();
    expect(screen.getByText("Téwá Nkrumah")).toBeTruthy();
    expect(screen.getByText("Not this month")).toBeTruthy();
    expect(screen.getByText("Since you started $4.98")).toBeTruthy();
    expect(screen.getAllByText("Founding")).toHaveLength(2);
    expect(screen.getAllByText("$3.33")).toHaveLength(2);
    expect(screen.getAllByText("33% this month")).toHaveLength(2);
    expect(screen.queryByText(/demo/i)).toBeNull();
    fireEvent.press(screen.getByLabelText("Manage routing"));
    expect(onManageRouting).toHaveBeenCalledTimes(1);
  });
});
