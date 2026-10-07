import { AuthLayout } from "@/components/auth/auth-layout";
import ForgotPasswordForm from "@/components/auth/forgot-password/forgot-password-form";
import React from "react";

const ForgotPasswordPage = () => {
    return (
        <AuthLayout
            title="Forgot Password"
            description="Enter Your Email And We Will Send You a Reset Link"
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
