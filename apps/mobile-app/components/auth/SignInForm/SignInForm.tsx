import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  emailSchema,
  handleAuthError,
  type SignInForm as SignInValues,
  signInSchema,
} from "shared";

import { COLORS } from "@/constants";
import { useStepBack } from "@/hooks";

import Button from "../../ui/Button/Button";
import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import AuthBackButton from "../AuthBackButton/AuthBackButton";
import AuthStepTransition from "../AuthStepTransition/AuthStepTransition";
import AuthTextField from "../AuthTextField/AuthTextField";

type SignInStep = "email" | "password";

const SignInForm: React.FC = () => {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [step, setStep] = useState<SignInStep>("email");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    getValues,
    handleSubmit,
    setError: setFieldError,
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const goToWelcome = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(auth)" as Href);
  };

  const goToEmail = useCallback(() => {
    setDirection("back");
    setStep("email");
    setError(null);
  }, []);

  useStepBack(step === "password", goToEmail);

  const onBack = () => {
    if (step === "password") {
      goToEmail();
      return;
    }
    goToWelcome();
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

  const onSubmit = async (values: SignInValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn("password", {
        email: values.email,
        password: values.password,
        flow: "signIn",
      });
    } catch (caught) {
      setError(handleAuthError(caught).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack spacing="lg" className="w-full">
      <AuthBackButton onPress={onBack} />
      <AuthStepTransition stepKey={step} direction={direction}>
        {step === "email" ? (
          <>
            <VStack spacing="sm">
              <Text className="font-app-semibold text-3xl text-text">
                {"What's your email?"}
              </Text>
              <Text className="text-base text-text/50">
                {"We'll use this to sign you in."}
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
        ) : (
          <>
            <VStack spacing="sm">
              <Text className="font-app-semibold text-3xl text-text">
                Enter your password
              </Text>
              <Text className="text-base text-text/50">
                {"Welcome back, let's get you listening."}
              </Text>
            </VStack>
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <AuthTextField
                  label="Password"
                  icon="lock-closed"
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="current-password"
                  autoFocus
                  returnKeyType="go"
                  value={field.value}
                  onChangeText={field.onChange}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  error={fieldState.error?.message}
                />
              )}
            />
            {error ? (
              <Text className="text-base text-danger">{error}</Text>
            ) : null}
            <Button
              text="Sign in"
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
              onPress={handleSubmit(onSubmit)}
            />
          </>
        )}
      </AuthStepTransition>
    </VStack>
  );
};

export default SignInForm;
