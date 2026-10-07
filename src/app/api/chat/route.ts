import { db } from "@/drizzle";
import { chats, messages } from "@/drizzle/schema";
import { assertChatOwner, getAuthenticatedUser } from "@/lib/actions/ownership";
import { AuthError, ForbiddenError } from "@/lib/error";
import {
    consumeMessageCredit,
    CreditsExhaustedError,
} from "@/lib/subscription/credits";
import { eq } from "drizzle-orm";

interface ValidStreamMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

interface ChatRequestBody {
    messages: ValidStreamMessage[];
    chatId: string;
}

const GROQ_MODEL = "openai/gpt-oss-20b";

export async function POST(req: Request) {
    try {
        const { messages: messageHistory, chatId } =
            (await req.json()) as ChatRequestBody;

        if (
            !chatId ||
            !Array.isArray(messageHistory) ||
            messageHistory.length === 0
        ) {
            return new Response("Missing Required Fields", {
                status: 400,
            });
        }

        const user = await getAuthenticatedUser();

        await assertChatOwner(user.id, chatId);

        const lastUserMessage = messageHistory[messageHistory.length - 1];

        if (lastUserMessage.role !== "user") {
            return new Response("Invalid Message History", {
                status: 400,
            });
        }

        const userContent =
            typeof lastUserMessage.content === "string"
                ? lastUserMessage.content
                : JSON.stringify(lastUserMessage.content);

        if (!userContent.trim()) {
            return new Response("Message Content Cannot Be Empty", {
                status: 400,
            });
        }

        const filteredMessages = messageHistory.filter(
            (msg) =>
                typeof msg.content === "string" && msg.content.trim() !== "",
        );

        /*
         * Ask Groq first.
         *
         * This prevents consuming a credit when Groq rejects
         * the request because of an API/model/configuration error.
         */
        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    stream: true,
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are Codevia AI, an elite software engineering assistant. Provide crisp, high-end, premium structured responses.",
                        },
                        ...filteredMessages.map((msg) => ({
                            role: msg.role,
                            content: msg.content,
                        })),
                    ],
                }),
            },
        );

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();

            console.error("Groq Raw Error:", errorText);

            return new Response(
                JSON.stringify({
                    error: "AI Provider Error",
                    message:
                        "The AI model is currently unavailable. Please try again later.",
                }),
                {
                    status: groqResponse.status,
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        /*
         * Consume the credit only after Groq accepts
         * the request successfully.
         */
        await consumeMessageCredit(user.id);

        /*
         * Save the user's message only after the AI request
         * has been accepted.
         */
        await db.insert(messages).values({
            chatId,
            role: "user",
            content: userContent,
        });

        /*
         * Update the chat title from the first user message.
         */
        if (messageHistory.length === 1) {
            void (async () => {
                try {
                    let cleanTitle = userContent.trim();

                    if (cleanTitle.length > 40) {
                        cleanTitle = cleanTitle.substring(0, 37) + "...";
                    }

                    await db
                        .update(chats)
                        .set({
                            title: cleanTitle,
                        })
                        .where(eq(chats.id, chatId));
                } catch (error) {
                    console.error("Failed To Update Chat Title:", error);
                }
            })();
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        let accumulatedAIResponse = "";

        const stream = new TransformStream<Uint8Array, Uint8Array>({
            async transform(chunk, controller) {
                const text = decoder.decode(chunk, {
                    stream: true,
                });

                const lines = text.split("\n");

                for (const line of lines) {
                    const cleanedLine = line.trim();

                    if (!cleanedLine || cleanedLine === "data: [DONE]") {
                        continue;
                    }

                    if (!cleanedLine.startsWith("data: ")) {
                        continue;
                    }

                    try {
                        const parsed = JSON.parse(cleanedLine.slice(6));

                        const content =
                            parsed.choices?.[0]?.delta?.content ?? "";

                        if (content) {
                            accumulatedAIResponse += content;

                            controller.enqueue(encoder.encode(content));
                        }
                    } catch (error) {
                        console.error("Error Parsing Groq Response:", error);
                    }
                }
            },

            async flush() {
                try {
                    if (!accumulatedAIResponse.trim()) {
                        return;
                    }

                    await db.insert(messages).values({
                        chatId,
                        role: "assistant",
                        content: accumulatedAIResponse,
                    });
                } catch (error) {
                    console.error("Error Saving AI Response:", error);
                }
            },
        });

        if (!groqResponse.body) {
            return new Response("AI Stream Unavailable", {
                status: 502,
            });
        }

        const responseStream = groqResponse.body.pipeThrough(stream);

        return new Response(responseStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return new Response("Unauthorized", {
                status: 401,
            });
        }

        if (error instanceof ForbiddenError) {
            return new Response("Forbidden", {
                status: 403,
            });
        }

        if (error instanceof CreditsExhaustedError) {
            return new Response(
                JSON.stringify({
                    error: "You Have Used All Your Message Credits",
                }),
                {
                    status: 402,
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        console.error("Native Fetch Chat Error:", error);

        return new Response("Internal Server Error", {
            status: 500,
        });
    }
}
