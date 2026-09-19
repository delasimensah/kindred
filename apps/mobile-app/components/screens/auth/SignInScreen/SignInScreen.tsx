import React from "react";

import { FONTS } from "@/constants";

import SignInForm from "../../../auth/SignInForm/SignInForm";
import KeyboardFormView from "../../../ui/KeyboardFormView/KeyboardFormView";
import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

const SignInScreen: React.FC = () => {
  return (
    <KeyboardFormView>
      <VStack spacing="xl" className="w-full">
        <Text
          className="text-center text-[32px] tracking-tight text-darkGrey"
          style={{ fontFamily: FONTS.black }}
        >
          Kindred
        </Text>
        <SignInForm />
        <Text className="text-center text-[14px] text-grey">
          Fans and supporters use this app. Artist Studio is on the web.
        </Text>
      </VStack>
    </KeyboardFormView>
  );
};

export default SignInScreen;
