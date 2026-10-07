import { AppSidebar } from "@/components/dashboard/sidebar";
import { getUserMetadata } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import React from "react";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
    const [user] = await Promise.all([getUserMetadata()]);

    if (!user) {
        redirect("/auth/login");
    }

    return (
        <div className="flex h-screen w-full bg-transparent text-foreground overflow-hidden antialiased">
            <AppSidebar user={user} />

            <main className="flex-1 flex flex-col h-full bg-muted/20 p-6 overflow-hidden">
                <div className="w-full max-w-7xl mx-auto h-full flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
