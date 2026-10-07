import { z } from "zod";

export const profileSchema = z.object({
    fullName: z
        .string()
        .min(1, "Full Name Is Required")
        .max(80, "Full Name Must Be Less Than 80 Characters"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
