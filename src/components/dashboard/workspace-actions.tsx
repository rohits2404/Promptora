"use client";

import { deleteWorkspace, updateWorkspace } from "@/lib/actions/workspaces";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Edit2, Loader2, MoreVertical, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "../ui/toast";

interface Workspace {
    id: string;
    name: string;
    profileId: string;
    createdAt: Date | null;
}

interface WorkspaceActionsProps {
    workspace: Workspace;
    isActive: boolean;
    onClearActive: () => void;
}

export function WorkspaceActions({
    workspace,
    isActive,
    onClearActive,
}: WorkspaceActionsProps) {
    const router = useRouter();

    const [isEditOpen, setIsEditOpen] = useState(false);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [editName, setEditName] = useState(workspace.name);

    const [isPending, setIsPending] = useState(false);

    const handleSaveEdit = async () => {
        if (!editName.trim() || isPending) {
            return;
        }

        try {
            setIsPending(true);

            const res = await updateWorkspace(workspace.id, editName.trim());

            if (res.success) {
                setIsEditOpen(false);
                toast.add({
                    title: "Workspace Renamed Successfully",
                });
                router.refresh();
            }
        } catch (error) {
            console.error("Error Updating Workspace:", error);
        } finally {
            setIsPending(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (isPending) {
            return;
        }

        try {
            setIsPending(true);

            const res = await deleteWorkspace(workspace.id);

            if (res.success) {
                setIsDeleteOpen(false);

                if (isActive) {
                    onClearActive();
                }

                toast.add({
                    title: `Workspace ${res.data?.name} Deleted Successfully`,
                });

                router.refresh();
            }
        } catch (error) {
            console.error("Error Deleting Workspace:", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <button
                            type="button"
                            className="rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            aria-label={`Actions for ${workspace.name}`}
                        >
                            <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                    }
                />

                <DropdownMenuContent
                    align="end"
                    className="w-32 rounded-xl border-border bg-popover"
                >
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditName(workspace.name);
                            setIsEditOpen(true);
                        }}
                        className="flex cursor-pointer items-center gap-2 text-xs"
                    >
                        <Edit2 className="h-3 w-3" />
                        Rename
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDeleteOpen(true);
                        }}
                        className="flex cursor-pointer items-center gap-2 text-xs text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-3 w-3" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Rename Workspace Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-sm rounded-2xl border-border bg-popover"
                >
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">
                            Rename Workspace
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-2">
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveEdit();
                                }
                            }}
                            className="h-9 rounded-xl border-border text-xs"
                            maxLength={30}
                            disabled={isPending}
                            autoFocus
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditOpen(false)}
                            className="rounded-xl text-xs"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="rounded-xl text-xs"
                            disabled={isPending || !editName.trim()}
                        >
                            {isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Workspace Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-sm rounded-2xl border-border bg-popover"
                >
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold text-destructive">
                            Delete Workspace
                        </DialogTitle>
                    </DialogHeader>

                    <p className="py-2 text-xs leading-relaxed text-muted-foreground">
                        Are You Sure You Want To Delete Workspace{" "}
                        <span className="font-bold text-foreground">
                            {workspace.name}
                        </span>
                        ? This Action Cannot Be Undone.
                    </p>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleteOpen(false)}
                            className="rounded-xl text-xs"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleConfirmDelete}
                            className="rounded-xl text-xs"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
