import React from "react";

import AuthScreenShell from "../../../auth/AuthScreenShell/AuthScreenShell";
import SignUpForm from "../../../auth/SignUpForm/SignUpForm";

const SignUpScreen: React.FC = () => {
  return (
    <AuthScreenShell glow="sign-up">
      <SignUpForm />
    </AuthScreenShell>
  );
};

export default SignUpScreen;
