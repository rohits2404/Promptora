"use client";

import { toast } from "@/components/ui/toast";
import { createZodResolver } from "@/lib/resolvers";
import { createClient } from "@/lib/supabase/client";
import { LoginFormValues, loginSchema } from "@/lib/validation/auth";
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
import Link from "next/link";
import { PasswordInput } from "../password-input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { GitHubAuthButton } from "../github-auth-button";

export function LoginForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: createZodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        try {
            const { data, error } =
                await createClient().auth.signInWithPassword({
                    email: values.email,
                    password: values.password,
                });

            if (error) {
                if (error.message.includes("Email Not Confirmed")) {
                    toast.add({
                        title: "Email Verification Pending.",
                        description:
                            "Please Check Your Inbox and Verify Your Email Before Logging In",
                    });
                } else {
                    toast.add({
                        title: error.message,
                    });
                }
                return;
            }
            toast.add({
                title: "Logged In Successfully",
            });
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.add({
                title: "Something Went Wrong. Please Try Again Later.",
            });
        }
    };

    return (
        <AuthCard>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Field data-invalid={!!errors.email}>
                        <FieldLabel htmlFor="login-email">Email</FieldLabel>
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            aria-invalid={!!errors.email}
                            {...register("email")}
                        />
                        <FieldError errors={[errors.email]} />
                    </Field>

                    <Field data-invalid={!!errors.password}>
                        <div className="flex items-center justify-between gap-2">
                            <FieldLabel htmlFor="login-password">
                                Password
                            </FieldLabel>
                            <Link
                                href={"/auth/forgot-password"}
                                className="
            text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline
              "
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <PasswordInput
                            id="login-password"
                            placeholder="*********"
                            autoComplete="current-password"
                            aria-invalid={!!errors.password}
                            {...register("password")}
                        />
                        <FieldError errors={[errors.password]} />
                    </Field>

                    <Button
                        type="submit"
                        className={"w-full"}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            <>Login</>
                        )}
                    </Button>

                    <FieldSeparator>Or Continue With</FieldSeparator>
                    <GitHubAuthButton label="Continue with Github" />
                    <p className="text-center text-sm text-muted-foreground">
                        Dont Have An Account?{" "}
                        <Link
                            href={"/auth/signup"}
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                            Sign Up
                        </Link>
                    </p>
                </FieldGroup>
            </form>
        </AuthCard>
    );
}
