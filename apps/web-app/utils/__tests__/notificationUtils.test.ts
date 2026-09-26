import { notifications } from "@mantine/notifications";

import {
  showErrorNotification,
  showInfoNotification,
  showSuccessNotification,
} from "../notificationUtils";

jest.mock("@mantine/notifications", () => ({
  notifications: {
    show: jest.fn(),
  },
}));

describe("Notification Utilities", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows success on brand gold with dark type classes", () => {
    showSuccessNotification("Update posted.");
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Success",
        message: "Update posted.",
        autoClose: 3000,
        classNames: expect.objectContaining({
          root: expect.stringContaining("!bg-primary"),
          title: expect.stringContaining("!text-textOnPrimary"),
        }),
      })
    );
  });

  it("shows error on danger with white type classes", () => {
    showErrorNotification("Could not save.", "Upload failed");
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Upload failed",
        message: "Could not save.",
        autoClose: false,
        classNames: expect.objectContaining({
          root: expect.stringContaining("!bg-danger"),
          title: expect.stringContaining("!text-white"),
        }),
      })
    );
  });

  it("shows info on surface with light type classes", () => {
    showInfoNotification("Heads up.");
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Info",
        message: "Heads up.",
        classNames: expect.objectContaining({
          root: expect.stringContaining("!bg-surface"),
        }),
      })
    );
  });
});
