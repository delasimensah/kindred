import { notifications } from "@mantine/notifications";

import {
  ErrorNotification,
  InfoNotification,
  SuccessNotification,
} from "./Notification";

jest.mock("@mantine/notifications", () => ({
  notifications: {
    show: jest.fn(),
  },
}));

describe("Notification helpers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows an error toast", () => {
    ErrorNotification({ message: "Something went wrong!" });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        message: "Something went wrong!",
        autoClose: false,
      })
    );
  });

  it("shows a success toast", () => {
    SuccessNotification({
      title: "Custom Success",
      message: "Action completed successfully!",
    });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Custom Success",
        message: "Action completed successfully!",
        autoClose: 3000,
      })
    );
  });

  it("shows an info toast", () => {
    InfoNotification({ message: "Informational message" });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Info",
        message: "Informational message",
      })
    );
  });
});
