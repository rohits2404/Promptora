"use client";

import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import {
    ForgotPasswordFormValues,
    forgotPasswordSchema,
} from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthCard } from "../auth-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordForm() {
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        try {
            const { error } = await createClient().auth.resetPasswordForEmail(
                values.email,
                {
                    redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
                },
            );

            if (error) {
                toast.add({
                    title: error.message,
                });

                return;
            }

            toast.add({
                title: "Password Reset Link Sent To Your Email",
            });

            setSent(true);
        } catch (error) {
            console.error("Password reset error:", error);

            toast.add({
                title: "Something Went Wrong. Please Try Again Later.",
            });
        }
    };

    if (sent) {
        return (
            <AuthCard>
                <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        If an account exists for{" "}
                        <span className="font-medium text-foreground">
                            {getValues("email")}
                        </span>
                        , we sent a password reset link to your email. Please
                        check your inbox.
                    </p>

                    {/* Back To Sign In */}
                    <Link
                        href="/auth/login"
                        className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        Back To Sign In
                    </Link>

                    {/* Try Another Email */}
                    <Link
                        href="/auth/forgot-password"
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Try Another Email
                    </Link>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup>
                    <Field data-invalid={!!errors.email}>
                        <FieldLabel htmlFor="forgot-email">Email</FieldLabel>

                        <Input
                            id="forgot-email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            aria-invalid={!!errors.email}
                            disabled={isSubmitting}
                            {...register("email")}
                        />

                        <FieldError errors={[errors.email]} />
                    </Field>

                    {/* Send Reset Link */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Sending Link...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>

                    {/* Back To Sign In */}
                    <Link
                        href="/auth/login"
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back To Sign In
                    </Link>
                </FieldGroup>
            </form>
        </AuthCard>
    );
}
