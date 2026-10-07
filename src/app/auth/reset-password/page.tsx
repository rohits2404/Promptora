import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password/reset-password-form";
import React from "react";

const ResetPasswordPage = () => {
    return (
        <AuthLayout
            title="Reset Your Password"
            description="Choose a New Password For Your Account"
        >
            <ResetPasswordForm />
        </AuthLayout>
    );
};

export default ResetPasswordPage;
