"use client";

import { getPrompts } from "@/lib/actions/prompts";
import React from "react";
import { toast } from "../ui/toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { BookMarked, Loader2 } from "lucide-react";

interface PromptPickerProps {
    workspaceId: string;
    onSelect: (content: string) => void;
    disabled?: boolean;
}

interface PromptItem {
    id: string;
    title: string;
    content: string;
    category: string;
    isFavorite: boolean;
}

export function PromptPicker({
    workspaceId,
    onSelect,
    disabled = false,
}: PromptPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [promptsList, setPromptsList] = React.useState<PromptItem[]>([]);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (nextOpen) {
            setIsLoading(true);
        }
    };

    React.useEffect(() => {
        if (!open) return;

        let cancelled = false;

        void (async () => {
            try {
                const data = await getPrompts(workspaceId);

                if (cancelled) return;

                setPromptsList(data);
            } catch (error) {
                if (cancelled) return;

                console.error("Failed to load prompts:", error);

                toast.add({
                    title: "Failed To Load Prompts.",
                });
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [open, workspaceId]);

    const handleSelect = (prompt: PromptItem) => {
        onSelect(prompt.content);
        setOpen(false);

        toast.add({
            title: `Inserted "${prompt.title}"`,
        });
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        className="absolute bottom-2.5 left-2.5 h-7 w-7 rounded-lg text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                        aria-label="Insert prompt"
                    >
                        <BookMarked className="h-3.5 w-3.5" />
                    </Button>
                }
            />

            <PopoverContent
                align="start"
                className="w-80 overflow-hidden rounded-xl border-border bg-popover p-0"
            >
                {/* Header */}
                <div className="border-b border-border/60 px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">
                        Prompt Library
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                        Insert a Saved Prompt Into Your Message
                    </p>
                </div>

                {/* Prompt list */}
                <div className="max-h-64 space-y-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/40" />
                        </div>
                    ) : promptsList.length === 0 ? (
                        <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                            No Prompts Available For This Workspace Yet.
                        </p>
                    ) : (
                        promptsList.map((prompt) => (
                            <button
                                key={prompt.id}
                                type="button"
                                onClick={() => handleSelect(prompt)}
                                className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent/40"
                            >
                                <p className="truncate text-xs font-medium text-foreground">
                                    {prompt.title}
                                </p>

                                <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
                                    {prompt.content}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
