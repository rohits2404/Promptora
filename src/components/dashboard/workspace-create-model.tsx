"use client";

import { createWorkspace } from "@/lib/actions/workspaces";
import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { toast } from "../ui/toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2, Plus } from "lucide-react";
import { Input } from "../ui/input";

interface WorkspaceCreateModelProps {
    children?: ReactElement;
}

export function WorkspaceCreateModel({ children }: WorkspaceCreateModelProps) {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim() || isCreating) {
            return;
        }

        try {
            setIsCreating(true);

            const result = await createWorkspace(name.trim());

            if (result.success && result.data) {
                setName("");
                setIsOpen(false);
                toast.add({
                    title: "Workspace Created",
                    description: `"${result.data.name}" Has Been Created Successfully.`,
                });
                router.refresh();
            } else {
                toast.add({
                    title: result.error || "Failed To Create Workspace",
                });
            }
        } catch (error) {
            console.error("Error Creating Workspace:", error);

            toast.add({
                title: "Failed To Create Workspace",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const trigger = children ?? (
        <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-md text-muted-foreground hover:text-foreground"
        >
            <Plus className="h-3.5 w-3.5" />
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={trigger} />

            <DialogContent className="max-w-sm rounded-2xl border border-border bg-popover">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-foreground">
                            Create Workspace
                        </DialogTitle>

                        <DialogDescription className="text-xs text-muted-foreground">
                            Create a New Space To Organize Your AI Chats and
                            Projects.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="workspace-name"
                                className="text-xs font-medium text-muted-foreground"
                            >
                                Workspace Name
                            </label>

                            <Input
                                id="workspace-name"
                                placeholder="e.g., Nextjs SaaS, German Study"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9 rounded-xl border-border text-xs"
                                maxLength={30}
                                required
                                disabled={isCreating}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isCreating}
                            className="h-9 rounded-xl border-border text-xs"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="h-9 rounded-xl bg-primary text-xs font-medium text-primary-foreground"
                            disabled={isCreating || !name.trim()}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
