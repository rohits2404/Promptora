"use server";

import { User } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";
import { AuthError, ForbiddenError } from "../error";
import { db } from "@/drizzle";

export async function getAuthenticatedUser(): Promise<User> {
    const supabase = createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new AuthError();
    }

    return user;
}

export async function assertWorkspaceOwner(
    userId: string,
    workspaceId: string,
) {
    const workspace = await db.query.workspaces.findFirst({
        where: {
            id: workspaceId,
            profileId: userId,
        },
    });

    if (!workspace) {
        throw new ForbiddenError("Workspace not found or unauthorized");
    }

    return workspace;
}

export async function assertChatOwner(userId: string, chatId: string) {
    const chat = await db.query.chats.findFirst({
        where: {
            id: chatId,
        },
        with: {
            workspace: true,
        },
    });

    if (!chat || !chat.workspace || chat.workspace.profileId !== userId) {
        throw new ForbiddenError("Chat Not Found or Unauthorized");
    }

    return chat;
}
