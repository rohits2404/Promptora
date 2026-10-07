import { PROJECT_NAME } from "@/constants";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="border-t border-border/60 bg-muted/20">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                                <Image
                                    alt="logo"
                                    src={"/logo.png"}
                                    width={30}
                                    height={30}
                                />
                            </div>
                            <span className="font-semibold text-foreground">
                                {PROJECT_NAME}
                            </span>
                        </div>

                        <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                            Your AI Workspace For Creating, Organizing, and
                            Reusing Everything That Matters.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
                            Product
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Features
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Changelog
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Roadmap
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
                            Company
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    About
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Privacy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Terms
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} {PROJECT_NAME}. All Rights
                        Reserved.
                    </p>

                    <p>Built For Modern AI-Powered Teams.</p>
                </div>
            </div>
        </footer>
    );
}
