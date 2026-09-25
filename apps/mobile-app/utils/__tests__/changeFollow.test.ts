import { Alert } from "react-native";

import { changeFollow } from "../changeFollow";

describe("changeFollow", () => {
  it("shows the server message when unfollow is refused", async () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    await changeFollow(async () => {
      throw {
        data: { message: "Remove this artist from support first." },
      };
    });
    expect(alert).toHaveBeenCalledWith(
      "Could not update follow",
      "Remove this artist from support first."
    );
    alert.mockRestore();
  });
});
