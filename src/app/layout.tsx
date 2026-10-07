import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
    title: "Promptora — AI Workspace",
    description:
        "A Multi-Tenant AI SaaS Workspace For Managing Persistent AI Conversations, Reusable Prompt Libraries, Workspaces, Usage Credits, And Subscription-Based AI Access.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className="h-full antialiased" suppressHydrationWarning>
            <body className="min-h-full flex flex-col">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>

                <Toaster />
            </body>
        </html>
    );
}
