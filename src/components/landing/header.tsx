import { PROJECT_NAME } from "@/constants";
import { ArrowRight } from "lucide-react";
import { navLinks } from "./constants";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
import { ThemeToggle } from "../theme-toggle";

export function LandingHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                {/* Logo */}
                <a href="#" className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-lg text-primary-foreground">
                        <Image
                            alt="logo"
                            src="/logo.png"
                            width={30}
                            height={30}
                        />
                    </span>

                    <span className="text-base font-semibold tracking-tight sm:text-lg">
                        {PROJECT_NAME}
                    </span>
                </a>

                {/* Navigation */}
                <nav className="flex flex-wrap items-center gap-1 sm:gap-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="
                                rounded-md px-3 py-1.5 text-sm
                                text-muted-foreground
                                transition-colors
                                hover:bg-muted
                                hover:text-foreground
                            "
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Sign In */}
                    <Link href="/auth/login">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden cursor-pointer sm:inline-flex"
                        >
                            Sign In
                        </Button>
                    </Link>

                    {/* Get Started */}
                    <Link href="/auth/login">
                        <Button size="sm" className="cursor-pointer">
                            Get Started
                            <ArrowRight
                                className="size-4"
                                data-icon="inline-end"
                            />
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
