import { fireEvent, render, screen } from "@testing-library/react-native";

import EditProfileScreen from "./EditProfileScreen";

describe("EditProfileScreen", () => {
  it("saves a new name and leaves the email as text", () => {
    const onSaveName = jest.fn();
    const onChangePhoto = jest.fn();
    render(
      <EditProfileScreen
        displayName="Efua Boateng"
        email="efua.boateng@kindred.example"
        avatarUrl={null}
        savingName={false}
        savingPhoto={false}
        notice={null}
        onChangePhoto={onChangePhoto}
        onSaveName={onSaveName}
      />
    );

    expect(screen.getByText("efua.boateng@kindred.example")).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: /email/i })).toBeNull();
    fireEvent.changeText(screen.getByLabelText("Name"), "Efua Mensah");
    fireEvent.press(screen.getByText("Save name"));
    expect(onSaveName).toHaveBeenCalledWith("Efua Mensah");
    fireEvent.press(screen.getByLabelText("Choose photo"));
    expect(onChangePhoto).toHaveBeenCalledTimes(1);
  });

  it("does not save a blank name", () => {
    const onSaveName = jest.fn();
    render(
      <EditProfileScreen
        displayName="Efua Boateng"
        email="efua.boateng@kindred.example"
        avatarUrl={null}
        savingName={false}
        savingPhoto={false}
        notice={null}
        onChangePhoto={jest.fn()}
        onSaveName={onSaveName}
      />
    );

    fireEvent.changeText(screen.getByLabelText("Name"), "   ");
    fireEvent.press(screen.getByText("Save name"));
    expect(onSaveName).not.toHaveBeenCalled();
  });
});
