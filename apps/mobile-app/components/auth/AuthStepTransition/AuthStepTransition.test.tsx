import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import AuthStepTransition from "./AuthStepTransition";

describe("AuthStepTransition", () => {
  it("renders the current step", () => {
    render(
      <AuthStepTransition stepKey="email" direction="forward">
        <Text>Email step</Text>
      </AuthStepTransition>
    );
    expect(screen.getByText("Email step")).toBeTruthy();
  });
});
