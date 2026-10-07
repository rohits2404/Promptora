"use server";

import { db } from "@/drizzle";
import { assertWorkspaceOwner, getAuthenticatedUser } from "./ownership";
import { promptSchema } from "../validation/prompt";
import { prompts } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

async function assertPromptOwner(userId: string, promptId: string) {
    const prompt = await db.query.prompts.findFirst({
        where: {
            id: promptId,
            profileId: userId,
        },
    });

    if (!prompt) {
        throw new Error("Prompt Not Found Or Unauthorized");
    }

    return prompt;
}

export async function getPrompts(workspaceId?: string | null) {
    try {
        const user = await getAuthenticatedUser();

        if (workspaceId) {
            await assertWorkspaceOwner(user.id, workspaceId);
        }

        const userPrompts = workspaceId
            ? await db.query.prompts.findMany({
                  where: {
                      profileId: user.id,
                      workspaceId,
                  },
                  orderBy: {
                      isFavorite: "desc",
                      createdAt: "desc",
                  },
              })
            : await db.query.prompts.findMany({
                  where: {
                      profileId: user.id,
                  },
                  orderBy: {
                      isFavorite: "desc",
                      createdAt: "desc",
                  },
              });

        return userPrompts;
    } catch (error) {
        console.error("Error Fetching Prompts:", error);
        return [];
    }
}

export async function createPrompt(input: {
    title: string;
    content: string;
    category: string;
    workspaceId?: string | null;
}) {
    try {
        const user = await getAuthenticatedUser();

        const parsed = promptSchema.safeParse(input);

        if (!parsed.success) {
            return {
                success: false as const,
                error: parsed.error.issues[0]?.message ?? "Invalid Prompt Data",
            };
        }

        if (parsed.data.workspaceId) {
            await assertWorkspaceOwner(user.id, parsed.data.workspaceId);
        }

        const [newPrompt] = await db
            .insert(prompts)
            .values({
                profileId: user.id,
                title: parsed.data.title,
                content: parsed.data.content,
                category: parsed.data.category,
                workspaceId: parsed.data.workspaceId ?? null,
            })
            .returning();

        revalidatePath("/dashboard/prompts");

        return {
            success: true as const,
            data: newPrompt,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed To Create Prompt";

        console.error("Error Creating Prompt:", error);

        return {
            success: false as const,
            error: errorMessage,
        };
    }
}

export async function updatePrompt(
    id: string,
    input: {
        title: string;
        content: string;
        category: string;
        workspaceId?: string | null;
    },
) {
    try {
        const user = await getAuthenticatedUser();

        await assertPromptOwner(user.id, id);

        const parsed = promptSchema.safeParse(input);

        if (!parsed.success) {
            return {
                success: false as const,
                error: parsed.error.issues[0]?.message ?? "Invalid Prompt Data",
            };
        }

        if (parsed.data.workspaceId) {
            await assertWorkspaceOwner(user.id, parsed.data.workspaceId);
        }

        const [updatedPrompt] = await db
            .update(prompts)
            .set({
                title: parsed.data.title,
                content: parsed.data.content,
                category: parsed.data.category,
                workspaceId: parsed.data.workspaceId ?? null,
            })
            .where(eq(prompts.id, id))
            .returning();

        revalidatePath("/dashboard/prompts");

        return {
            success: true as const,
            data: updatedPrompt,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed To Update Prompt";

        console.error("Error Updating Prompt:", error);

        return {
            success: false as const,
            error: errorMessage,
        };
    }
}

export async function deletePrompt(id: string) {
    try {
        const user = await getAuthenticatedUser();

        await assertPromptOwner(user.id, id);

        await db.delete(prompts).where(eq(prompts.id, id));

        revalidatePath("/dashboard/prompts");

        return {
            success: true as const,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed To Delete Prompt";

        console.error("Error Deleting Prompt:", error);

        return {
            success: false as const,
            error: errorMessage,
        };
    }
}

export async function toggleFavoritePrompt(id: string, isFavorite: boolean) {
    try {
        const user = await getAuthenticatedUser();

        await assertPromptOwner(user.id, id);

        const [updatedPrompt] = await db
            .update(prompts)
            .set({
                isFavorite,
            })
            .where(eq(prompts.id, id))
            .returning();

        revalidatePath("/dashboard/prompts");

        return {
            success: true as const,
            data: updatedPrompt,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed To Toggle Favorite Prompt";

        console.error("Error Toggling Favorite Prompt:", error);

        return {
            success: false as const,
            error: errorMessage,
        };
    }
}
