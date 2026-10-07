"use server";

import { db } from "@/drizzle";
import {
    assertChatOwner,
    assertWorkspaceOwner,
    getAuthenticatedUser,
} from "./ownership";
import { chats } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// Get all chats for a workspace
export async function getChats(workspaceId: string) {
    try {
        const user = await getAuthenticatedUser();

        await assertWorkspaceOwner(user.id, workspaceId);

        const workspaceChats = await db.query.chats.findMany({
            where: {
                workspaceId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return workspaceChats;
    } catch (error) {
        console.error("Error Fetching Chats:", error);
        return [];
    }
}

// Create chat
export async function createChat(
    workspaceId: string,
    title: string = "New Chat Session",
) {
    try {
        const user = await getAuthenticatedUser();

        if (!workspaceId) {
            throw new Error("Workspace ID Is Required");
        }

        await assertWorkspaceOwner(user.id, workspaceId);

        const [newChat] = await db
            .insert(chats)
            .values({
                title: title.trim() || "New Chat Session",
                workspaceId,
                isPinned: false,
            })
            .returning();

        revalidatePath("/dashboard");

        return {
            success: true,
            data: newChat,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed To Create Chat";

        console.error("Error Creating Chat:", error);

        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Update chat title
export async function updateChat(id: string, newTitle: string) {
    try {
        const user = await getAuthenticatedUser();

        if (!newTitle.trim()) {
            throw new Error("Title Is Required");
        }

        await assertChatOwner(user.id, id);

        const [updatedChat] = await db
            .update(chats)
            .set({
                title: newTitle.trim(),
            })
            .where(eq(chats.id, id))
            .returning();

        if (!updatedChat) {
            return {
                success: false,
                error: "Chat Not Found",
            };
        }

        revalidatePath("/dashboard");

        return {
            success: true,
            data: updatedChat,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed To Update Chat";

        console.error("Error Updating Chat:", error);

        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Toggle chat pin
export async function togglePinChat(id: string, isPinned: boolean) {
    try {
        const user = await getAuthenticatedUser();

        await assertChatOwner(user.id, id);

        const [updatedChat] = await db
            .update(chats)
            .set({
                isPinned,
            })
            .where(eq(chats.id, id))
            .returning();

        if (!updatedChat) {
            return {
                success: false,
                error: "Chat Not Found",
            };
        }

        revalidatePath("/dashboard");

        return {
            success: true,
            data: updatedChat,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed To Update Chat";

        console.error("Error Updating Chat:", error);

        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Delete chat
export async function deleteChat(id: string) {
    try {
        const user = await getAuthenticatedUser();

        await assertChatOwner(user.id, id);

        const [deletedChat] = await db
            .delete(chats)
            .where(eq(chats.id, id))
            .returning();

        if (!deletedChat) {
            return {
                success: false,
                error: "Chat Not Found",
            };
        }

        revalidatePath("/dashboard");

        return {
            success: true,
            data: deletedChat,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed To Delete Chat";

        console.error("Error Deleting Chat:", error);

        return {
            success: false,
            error: errorMessage,
        };
    }
}
