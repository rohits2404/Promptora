import { PROJECT_NAME } from "@/constants";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function HeroSection() {
    return (
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pt-24 lg:px-8 lg:pt-28">
            <div className="mx-auto max-w-exl text-center">
                <Badge variant="secondary" className="mb-6">
                    {PROJECT_NAME}
                </Badge>

                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                    Create, Organize, And{" "}
                    <span className="bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        Reuse
                    </span>{" "}
                    Your AI Work
                </h1>

                <p className="mt-6 text-lg text-muted-foreground text-pretty sm:text-xl">
                    {PROJECT_NAME} Is Not Just Another Chat App. It Is A
                    Structured Productivity Environment For Working With AI —
                    Workspaces, Persistent Conversations, And A Prompt Library
                    Built In.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link href={"/auth/login"}>
                        <Button>Start Building</Button>
                    </Link>

                    <Button
                        variant={"outline"}
                        size={"lg"}
                        className={"w-full sm:w-auto"}
                    >
                        <a href="#features">Explore Features</a>
                    </Button>
                </div>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2">
                <Card className="border-dashed bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-violet-300">
                            Instead Of...
                        </CardTitle>
                        <CardDescription className="text-base text-foreground/80">
                            Just Chatting With AI And Losing Context Every
                            Session.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="border-violet-500/30 bg-violet-500/5 ring-violet-500/20">
                    <CardHeader>
                        <CardTitle className="text-violet-300">
                            You Get…
                        </CardTitle>
                        <CardDescription className="text-base text-foreground/90">
                            A System To Create, Organize, And Reuse AI Output
                            Inside Structured Workspaces.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </section>
    );
}
