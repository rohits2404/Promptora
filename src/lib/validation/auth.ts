import { z } from "zod";

const emailSchema = z
    .string()
    .min(1, "Email Is Required")
    .email("Invalid Email Address");

const passwordSchema = z
    .string()
    .min(1, "Password Is Required")
    .min(8, "Password Must Be At Least 8 Characters Long");

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const signupSchema = z
    .object({
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Please Confirm Your Password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords Do Not Match",
        path: ["confirmPassword"],
    });

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Please Confirm Your Password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords Do Not Match",
        path: ["confirmPassword"],
    });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
