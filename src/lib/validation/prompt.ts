import { PROMPT_CATEGORIES } from "@/constants";
import { z } from "zod";

export const promptSchema = z.object({
    title: z
        .string()
        .min(1, "Title Is Required")
        .max(80, "Title Must Be Less Than 80 Characters"),
    content: z
        .string()
        .min(1, "Content Is Required")
        .max(4000, "Prompt Must Be Less Than 4000 Characters"),
    category: z.enum(PROMPT_CATEGORIES),
    workspaceId: z.string().uuid().nullable().optional(),
});

export type promptFormValues = z.infer<typeof promptSchema>;
