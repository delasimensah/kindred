import React from "react";

import AuthScreenShell from "../../../auth/AuthScreenShell/AuthScreenShell";
import SignInForm from "../../../auth/SignInForm/SignInForm";

const SignInScreen: React.FC = () => {
  return (
    <AuthScreenShell glow="sign-in">
      <SignInForm />
    </AuthScreenShell>
  );
};

export default SignInScreen;
