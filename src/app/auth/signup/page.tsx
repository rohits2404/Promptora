import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up/sign-up-form";
import React from "react";

const SignUpPage = () => {
    return (
        <AuthLayout
            title="Create Your Account"
            description="Start Organizing Your AI Work In Minutes"
        >
            <SignUpForm />
        </AuthLayout>
    );
};

export default SignUpPage;
