"use client";

import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import {
    ResetPasswordFormValues,
    resetPasswordSchema,
} from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthCard } from "../auth-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "../password-input";
import { ArrowLeft, Loader2 } from "lucide-react";

export function ResetPasswordForm() {
    const [done, setDone] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: ResetPasswordFormValues) => {
        try {
            const { error } = await createClient().auth.updateUser({
                password: values.password,
            });

            if (error) {
                toast.add({
                    title: error.message,
                });
                return;
            }

            toast.add({
                title: "Password Updated Successfully",
            });
            setDone(true);
        } catch (error) {
            console.error(error);
            toast.add({
                title: "Something Went Wrong. Please Try Again Later.",
            });
        }
    };

    if (done) {
        return (
            <AuthCard>
                <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Your Password Has Been Updated Successfully. You Can Now
                        Login With Your New Password.
                    </p>

                    <Button className={"w-full"}>
                        <Link href={"/auth/login"}>Sign In</Link>
                    </Button>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup>
                    <Field data-invalid={!!errors.password}>
                        <FieldLabel htmlFor="reset-password">
                            New Password
                        </FieldLabel>
                        <PasswordInput
                            id="reset-password"
                            autoComplete="new-password"
                            placeholder="********"
                            aria-invalid={!!errors.password}
                            {...register("password")}
                        />
                        <FieldError errors={[errors.password]} />
                    </Field>

                    <Field data-invalid={!!errors.confirmPassword}>
                        <FieldLabel htmlFor="reset-confirm-password">
                            Confirm New Password
                        </FieldLabel>
                        <PasswordInput
                            id="reset-confirm-password"
                            autoComplete="new-password"
                            placeholder="********"
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
                                Updating Password....
                            </>
                        ) : (
                            <>Reset Password</>
                        )}
                    </Button>

                    <Button variant={"ghost"} className={"w-full"}>
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
