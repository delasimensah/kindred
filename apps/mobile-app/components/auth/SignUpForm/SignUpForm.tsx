import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  emailSchema,
  handleAuthError,
  passwordSchema,
  type SignUpForm as SignUpValues,
  signUpSchema,
} from "shared";

import { COLORS } from "@/constants";
import { useStepBack } from "@/hooks";

import Button from "../../ui/Button/Button";
import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import AuthBackButton from "../AuthBackButton/AuthBackButton";
import AuthStepTransition from "../AuthStepTransition/AuthStepTransition";
import AuthTextField from "../AuthTextField/AuthTextField";

type SignUpStep = "name" | "email" | "password";

const SignUpForm: React.FC = () => {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [step, setStep] = useState<SignUpStep>("name");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    getValues,
    handleSubmit,
    setError: setFieldError,
    setValue,
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const goToWelcome = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(auth)" as Href);
  };

  const goBackStep = useCallback(() => {
    setDirection("back");
    setError(null);
    setStep((current) => (current === "password" ? "email" : "name"));
  }, []);

  useStepBack(step !== "name", goBackStep);

  const onBack = () => {
    if (step === "name") {
      goToWelcome();
      return;
    }
    goBackStep();
  };

  const goToEmail = () => {
    const name = getValues("displayName").trim();
    if (name.length === 0) {
      setFieldError("displayName", { message: "Enter your full name" });
      return;
    }
    setDirection("forward");
    setStep("email");
    setError(null);
  };

  const goToPassword = () => {
    const parsed = emailSchema.safeParse(getValues("email"));
    if (!parsed.success) {
      setFieldError("email", {
        message: parsed.error.issues[0]?.message ?? "Enter a valid email",
      });
      return;
    }
    setDirection("forward");
    setStep("password");
    setError(null);
  };

  const onSubmit = async (values: SignUpValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn("password", {
        email: values.email,
        password: values.password,
        name: values.displayName,
        flow: "signUp",
      });
    } catch (caught) {
      setError(handleAuthError(caught).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSignUp = () => {
    const parsed = passwordSchema.safeParse(getValues("password"));
    if (!parsed.success) {
      setFieldError("password", {
        message: parsed.error.issues[0]?.message ?? "Enter a password",
      });
      return;
    }
    setValue("confirmPassword", getValues("password"));
    void handleSubmit(onSubmit)();
  };

  return (
    <VStack spacing="lg" className="w-full">
      <AuthBackButton onPress={onBack} />
      <AuthStepTransition stepKey={step} direction={direction}>
        {step === "name" ? (
          <>
            <VStack spacing="sm">
              <Text className="font-app-semibold text-3xl text-text">
                {"What's your name?"}
              </Text>
              <Text className="text-base text-text/50">
                This is how you show up on Kindred.
              </Text>
            </VStack>
            <Controller
              control={control}
              name="displayName"
              render={({ field, fieldState }) => (
                <AuthTextField
                  label="Full name"
                  icon="person-outline"
                  placeholder="Your name"
                  autoComplete="name"
                  autoFocus
                  returnKeyType="next"
                  value={field.value}
                  onChangeText={field.onChange}
                  onSubmitEditing={goToEmail}
                  error={fieldState.error?.message}
                />
              )}
            />
            {error ? (
              <Text className="text-base text-danger">{error}</Text>
            ) : null}
            <Button
              text="Continue"
              size="lg"
              fullWidth
              className="rounded-full"
              textClassName="text-lg font-app-semibold"
              style={{
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 8,
              }}
              onPress={goToEmail}
            />
          </>
        ) : null}
        {step === "email" ? (
          <>
            <VStack spacing="sm">
              <Text className="font-app-semibold text-3xl text-text">
                {"What's your email?"}
              </Text>
              <Text className="text-base text-text/50">
                {"We'll use this to create your account."}
              </Text>
            </VStack>
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <AuthTextField
                  label="Email"
                  icon="mail-outline"
                  placeholder="you@email.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus
                  keyboardType="email-address"
                  returnKeyType="next"
                  value={field.value}
                  onChangeText={field.onChange}
                  onSubmitEditing={goToPassword}
                  error={fieldState.error?.message}
                />
              )}
            />
            {error ? (
              <Text className="text-base text-danger">{error}</Text>
            ) : null}
            <Button
              text="Continue"
              size="lg"
              fullWidth
              className="rounded-full"
              textClassName="text-lg font-app-semibold"
              style={{
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 8,
              }}
              onPress={goToPassword}
            />
          </>
        ) : null}
        {step === "password" ? (
          <>
            <VStack spacing="sm">
              <Text className="font-app-semibold text-3xl text-text">
                Create a password
              </Text>
              <Text className="text-base text-text/50">
                At least 8 characters.
              </Text>
            </VStack>
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <AuthTextField
                  label="Password"
                  icon="lock-closed"
                  placeholder="At least 8 characters"
                  secureTextEntry
                  autoComplete="new-password"
                  autoFocus
                  returnKeyType="go"
                  value={field.value}
                  onChangeText={(value) => {
                    field.onChange(value);
                    setValue("confirmPassword", value);
                  }}
                  onSubmitEditing={submitSignUp}
                  error={fieldState.error?.message}
                />
              )}
            />
            {error ? (
              <Text className="text-base text-danger">{error}</Text>
            ) : null}
            <Button
              text="Create account"
              size="lg"
              fullWidth
              loading={isSubmitting}
              className="rounded-full"
              textClassName="text-lg font-app-semibold"
              style={{
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 8,
              }}
              onPress={submitSignUp}
            />
          </>
        ) : null}
      </AuthStepTransition>
    </VStack>
  );
};

export default SignUpForm;
