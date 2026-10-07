import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
    profiles: {
        workspaces: r.many.workspaces(),

        subscriptions: r.one.subscriptions({
            from: r.profiles.id,
            to: r.subscriptions.profileId,
        }),
    },

    workspaces: {
        profile: r.one.profiles({
            from: r.workspaces.profileId,
            to: r.profiles.id,
        }),

        chats: r.many.chats(),
    },

    chats: {
        workspace: r.one.workspaces({
            from: r.chats.workspaceId,
            to: r.workspaces.id,
        }),

        messages: r.many.messages(),
    },

    messages: {
        chat: r.one.chats({
            from: r.messages.chatId,
            to: r.chats.id,
        }),
    },

    prompts: {
        profile: r.one.profiles({
            from: r.prompts.profileId,
            to: r.profiles.id,
        }),

        workspace: r.one.workspaces({
            from: r.prompts.workspaceId,
            to: r.workspaces.id,
        }),
    },
}));
