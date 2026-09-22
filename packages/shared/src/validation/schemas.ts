import { z } from "zod";

export const emailSchema = z
  .string()
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long");

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(1, "Enter your full name"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordUpdateSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpForm = z.infer<typeof signUpSchema>;
export type SignInForm = z.infer<typeof signInSchema>;
export type PasswordResetForm = z.infer<typeof passwordResetSchema>;
export type PasswordUpdateForm = z.infer<typeof passwordUpdateSchema>;
