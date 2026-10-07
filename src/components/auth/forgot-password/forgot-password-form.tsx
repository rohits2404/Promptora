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
            console.error(error);
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
                        If An Account Exists For
                        <span className="font-medium text-foreground">
                            {getValues("email")}
                        </span>
                        We Sent a Reset Password Link . Check Your Inbox.
                    </p>

                    <Button variant={"outline"} className={"w-full"}>
                        <Link href={"/auth/reset-password"}>
                            Continue To Reset Password
                        </Link>
                    </Button>

                    <Button variant={"ghost"} className={"w-full"}>
                        <Link href={"/auth/login"}>
                            <ArrowLeft className="size-4" />
                            Back To Sign In
                        </Link>
                    </Button>
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
                            {...register("email")}
                        />
                        <FieldError errors={[errors.email]} />
                    </Field>

                    <Button
                        type="submit"
                        className={"w-full"}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Sending Link....
                            </>
                        ) : (
                            <>Send Reset Link</>
                        )}
                    </Button>

                    <Button variant={"ghost"} className={"w-full flex"}>
                        <Link
                            href={"/auth/login"}
                            className="flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="size-4" />
                            Back To Sign In
                        </Link>
                    </Button>
                </FieldGroup>
            </form>
        </AuthCard>
    );
}
