"use client";

import { toast } from "@/components/ui/toast";
import { createZodResolver } from "@/lib/resolvers";
import { createClient } from "@/lib/supabase/client";
import { SignupFormValues, signupSchema } from "@/lib/validation/auth";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthCard } from "../auth-card";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "../password-input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { GitHubAuthButton } from "../github-auth-button";
import Link from "next/link";

export function SignUpForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormValues>({
        resolver: createZodResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: SignupFormValues) => {
        try {
            const { data, error } = await createClient().auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
                },
            });

            if (error) {
                console.log(error.message);
                return;
            }

            const userAlreadyExists =
                data?.user?.identities && data.user.identities.length === 0;

            if (userAlreadyExists) {
                toast.add({
                    title: "User Already Exists.",
                });
            } else {
                toast.add({
                    title: "Account Created Successfully",
                    description:
                        "Please Check Your Email For Verify Your Account",
                });
                router.push("/auth/login");
            }
        } catch (error) {
            console.error(error);
            toast.add({
                title: "Something Went Wrong. Please Try Again Later.",
            });
        }
    };

    return (
        <AuthCard>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup>
                    <Field data-invalid={!!errors.email}>
                        <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                        <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            aria-invalid={!!errors.email}
                            {...register("email")}
                        />
                        <FieldError errors={[errors.password]} />
                    </Field>

                    <Field data-invalid={!!errors.password}>
                        <FieldLabel htmlFor="signup-password">
                            Password
                        </FieldLabel>
                        <PasswordInput
                            id="signup-password"
                            placeholder="********"
                            autoComplete="new-password"
                            aria-invalid={!!errors.password}
                            {...register("password")}
                        />
                        <FieldError errors={[errors.password]} />
                    </Field>

                    <Field data-invalid={!!errors.confirmPassword}>
                        <FieldLabel htmlFor="signup-confirm-password">
                            Confirm Password
                        </FieldLabel>
                        <PasswordInput
                            id="signup-confirm-password"
                            placeholder="********"
                            autoComplete="new-password"
                            aria-invalid={!!errors.confirmPassword}
                            {...register("confirmPassword")}
                        />
                        <FieldError errors={[errors.confirmPassword]} />
                    </Field>

                    <Button
                        type="submit"
                        className={"w-full"}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>Create Account</>
                        )}
                    </Button>

                    <FieldSeparator>or</FieldSeparator>
                    <GitHubAuthButton label="Continue with Github" />
                    <p className="text-center text-sm text-muted-foreground">
                        Already Have An Account?{" "}
                        <Link
                            href={"/auth/login"}
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                            Sign In
                        </Link>
                    </p>
                </FieldGroup>
            </form>
        </AuthCard>
    );
}
