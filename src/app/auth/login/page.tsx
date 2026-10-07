import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login/login-form";
import React from "react";

const LoginPage = () => {
    return (
        <AuthLayout
            title="Welcome Back"
            description="Sign In To Your Workspace To Continue"
        >
            <LoginForm />
        </AuthLayout>
    );
};

export default LoginPage;
