import { fireEvent, render, screen } from "@testing-library/react-native";

import AccountAvatarButton from "./AccountAvatarButton";

describe("AccountAvatarButton", () => {
  it("opens account when pressed", () => {
    const onPress = jest.fn();
    render(<AccountAvatarButton displayName="Efua" onPress={onPress} />);

    fireEvent.press(screen.getByLabelText("Account"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
