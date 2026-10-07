import { ChatInterface } from "@/components/chat/chat-interface";
import { db } from "@/drizzle";
import { assertChatOwner, getAuthenticatedUser } from "@/lib/actions/ownership";
import { getUserMetadata } from "@/lib/actions/user";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ChatPageProps {
    params: Promise<{
        chatId: string;
    }>;
}

interface FormattedMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

const ChatPage = async ({ params }: ChatPageProps) => {
    const { chatId } = await params;

    if (!chatId) {
        notFound();
    }

    let currentChat;

    try {
        const user = await getAuthenticatedUser();

        currentChat = await assertChatOwner(user.id, chatId);
    } catch (error) {
        console.error("Failed to load chat:", error);
        notFound();
    }

    const initialMessages = await db.query.messages.findMany({
        where: {
            chatId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    const formattedMessages: FormattedMessage[] = initialMessages.map(
        (message) => {
            const safeRole: "user" | "assistant" =
                message.role === "user" || message.role === "assistant"
                    ? message.role
                    : "user";

            return {
                id: message.id,
                role: safeRole,
                content: message.content,
            };
        },
    );

    const userMetadata = await getUserMetadata();

    return (
        <div className="flex h-full flex-1 flex-col overflow-hidden bg-transparent">
            {/* Header */}
            <div className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-sm sm:px-8">
                <div className="flex min-w-0 items-center gap-2">
                    <Link
                        href={`/dashboard?workspace=${currentChat.workspaceId}`}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Back to workspace chats"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div
                        className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
                        aria-hidden="true"
                    />

                    <h2 className="max-w-md truncate text-xs font-semibold text-foreground">
                        {currentChat.title}
                    </h2>
                </div>
            </div>

            {/* Chat */}
            <ChatInterface
                chatId={chatId}
                workspaceId={currentChat.workspaceId}
                initialMessages={formattedMessages}
                userAvatarUrl={userMetadata?.avatarUrl ?? ""}
                userFullName={userMetadata?.fullName ?? "user"}
            />
        </div>
    );
};

export default ChatPage;
