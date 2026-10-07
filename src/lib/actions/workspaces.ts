"use server";

import { db } from "@/drizzle";
import { assertWorkspaceOwner, getAuthenticatedUser } from "./ownership";
import { profiles, workspaces } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function getWorkspaces() {
    const user = await getAuthenticatedUser();

    return await db.query.workspaces.findMany({
        where: {
            profileId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function createWorkspace(name: string) {
    try {
        const user = await getAuthenticatedUser();

        const trimmedName = name.trim();

        if (!trimmedName) {
            return {
                success: false,
                error: "Workspace Name Is Required",
            };
        }

        if (trimmedName.length > 30) {
            return {
                success: false,
                error: "Workspace Name Must Be 30 Characters Or Less",
            };
        }

        const existingProfile = await db.query.profiles.findFirst({
            where: {
                id: user.id,
            },
        });

        if (!existingProfile) {
            await db.insert(profiles).values({
                id: user.id,
                fullName:
                    user.user_metadata?.full_name ??
                    user.user_metadata?.name ??
                    null,
                avatarUrl:
                    user.user_metadata?.avatar_url ??
                    user.user_metadata?.picture ??
                    null,
            });
        }

        const [newWorkspace] = await db
            .insert(workspaces)
            .values({
                name: trimmedName,
                profileId: user.id,
            })
            .returning();

        if (!newWorkspace) {
            return {
                success: false,
                error: "Failed To Create Workspace",
            };
        }

        revalidatePath("/dashboard");

        return {
            success: true,
            data: newWorkspace,
        };
    } catch (error) {
        console.error("Error Creating Workspace:", error);

        return {
            success: false,
            error: "Failed To Create Workspace",
        };
    }
}

export async function updateWorkspace(workspaceId: string, name: string) {
    try {
        const user = await getAuthenticatedUser();

        const trimmedName = name.trim();

        if (!trimmedName) {
            return {
                success: false,
                error: "Workspace Name Is Required",
            };
        }

        if (trimmedName.length > 30) {
            return {
                success: false,
                error: "Workspace Name Must Be 30 Characters Or Less",
            };
        }

        await assertWorkspaceOwner(user.id, workspaceId);

        const [updatedWorkspace] = await db
            .update(workspaces)
            .set({
                name: trimmedName,
            })
            .where(eq(workspaces.id, workspaceId))
            .returning();

        if (!updatedWorkspace) {
            return {
                success: false,
                error: "Workspace Not Found",
            };
        }

        revalidatePath("/dashboard");

        return {
            success: true,
            data: updatedWorkspace,
        };
    } catch (error) {
        console.error("Error Updating Workspace:", error);

        return {
            success: false,
            error: "Failed To Update Workspace",
        };
    }
}

export async function deleteWorkspace(workspaceId: string) {
    try {
        const user = await getAuthenticatedUser();

        await assertWorkspaceOwner(user.id, workspaceId);

        const [deletedWorkspace] = await db
            .delete(workspaces)
            .where(eq(workspaces.id, workspaceId))
            .returning();

        if (!deletedWorkspace) {
            return {
                success: false,
                error: "Workspace Not Found",
            };
        }

        revalidatePath("/dashboard");

        return {
            success: true,
            data: deletedWorkspace,
        };
    } catch (error) {
        console.error("Error Deleting Workspace:", error);

        return {
            success: false,
            error: "Failed To Delete Workspace",
        };
    }
}
