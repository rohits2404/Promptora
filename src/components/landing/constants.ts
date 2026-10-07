import {
    BookMarked,
    Bot,
    FolderKanban,
    LayoutDashboard,
    Lock,
    MessageSquare,
    Sparkles,
    Zap,
} from "lucide-react";

export const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#roadmap", label: "Roadmap" },
    { href: "#mvp", label: "MVP" },
] as const;

export const features = [
    {
        icon: Lock,
        title: "Authentication",
        description:
            "Signup, Login, Sessions, And Protected Routes So Every Workspace Stays Private.",
        status: "MVP",
    },
    {
        icon: LayoutDashboard,
        title: "User Dashboard",
        description:
            "Your Central Hub — Recent Chats, Saved Prompts, And Quick Actions In One Place.",
        status: "MVP",
    },
    {
        icon: FolderKanban,
        title: "Workspaces",
        description:
            "Create, Switch, And Isolate Contexts — Startup Ideas, Coding Help, Design, And More.",
        status: "MVP",
    },
    {
        icon: MessageSquare,
        title: "AI Chat",
        description:
            "Streaming Conversations With Markdown And Code Blocks, Scoped To Each Workspace.",
        status: "MVP",
    },
    {
        icon: Bot,
        title: "Message Persistence",
        description:
            "Save User And AI Messages, Load History, And Pick Up Exactly Where You Left Off.",
        status: "MVP",
    },
    {
        icon: BookMarked,
        title: "Prompt Library",
        description:
            "Create, Categorize, Favorite, And Reuse Prompts Directly Inside Chat.",
        status: "Soon",
    },
    {
        icon: Sparkles,
        title: "Settings",
        description:
            "Theme, Profile, And Personalization — Dark Mode Included.",
        status: "Soon",
    },
    {
        icon: Zap,
        title: "SaaS & Billing",
        description:
            "Subscriptions, Stripe Checkout, And Usage Limits When You're Ready To Monetize.",
        status: "Phase 2",
    },
] as const;

export const phases = [
    {
        step: "01",
        title: "Foundation",
        items: "Auth · Database · Protected Routes",
    },
    {
        step: "02",
        title: "Core Product",
        items: "Dashboard · Workspaces · Navigation",
    },
    {
        step: "03",
        title: "AI Chat Engine",
        items: "Streaming · History · Markdown",
    },
    {
        step: "04",
        title: "Productivity",
        items: "Prompt Library · Search & Filter",
    },
    { step: "05", title: "Polish", items: "Settings · Loading · Mobile UX" },
    { step: "06", title: "SaaS Layer", items: "Stripe · Plans · Usage Limits" },
] as const;

export const mvpItems = [
    "Login System",
    "Workspace System",
    "AI Chat With Streaming",
    "Save & Load Conversations",
    "Basic Dashboard",
] as const;

export const keyPrinciples = [
    "Build Core First — Chat And Workspace.",
    "Everything Else Is Secondary.",
    "Avoid Overengineering Early.",
    "Focus On A Working Product, Not Perfect Architecture.",
] as const;
