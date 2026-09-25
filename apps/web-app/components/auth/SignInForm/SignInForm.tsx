"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLock, IconMail } from "@tabler/icons-react";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  handleAuthError,
  type SignInForm as SignInValues,
  signInSchema,
} from "shared";

import Text from "../../ui/Text/Text";

const inputClassNames = {
  label: "mb-2 text-sm text-text/70",
  input:
    "rounded-xl border-white/10 bg-page py-3 pl-11 pr-4 text-sm text-text placeholder:text-text/30 focus:border-primary/60",
  section: "text-text/35",
  error: "mt-1 text-sm text-danger",
};

const SignInForm: React.FC = () => {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignInValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: zod4Resolver(signInSchema),
  });

  const handleSubmit = async (values: SignInValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn("password", {
        email: values.email,
        password: values.password,
        flow: "signIn",
      });
      router.replace("/");
    } catch (caught) {
      setError(handleAuthError(caught).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="flex w-full flex-col gap-5"
      onSubmit={form.onSubmit(handleSubmit)}
      noValidate
    >
      <TextInput
        id="email"
        label="Email"
        placeholder="you@yourlabel.com"
        type="email"
        autoComplete="email"
        leftSection={<IconMail size={16} stroke={1.5} aria-hidden />}
        classNames={inputClassNames}
        {...form.getInputProps("email")}
      />
      <PasswordInput
        id="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        leftSection={<IconLock size={16} stroke={1.5} aria-hidden />}
        classNames={{
          ...inputClassNames,
          input:
            "rounded-xl border-white/10 bg-page py-3 pl-11 pr-11 text-sm text-text placeholder:text-text/30 focus:border-primary/60",
          visibilityToggle: "text-text/35",
        }}
        {...form.getInputProps("password")}
      />
      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
      <Button
        type="submit"
        loading={isSubmitting}
        className="mt-2 h-auto rounded-xl bg-primary py-3.5 text-sm font-semibold text-textOnPrimary hover:brightness-95"
      >
        Sign in
      </Button>
    </form>
  );
};

export default SignInForm;
