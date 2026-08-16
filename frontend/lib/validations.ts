import { z } from "zod";

export const registerSchema = z.object({
    email: z
        .string()
        .email("Invalid email address"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});

export type RegisterFormData = z.infer<
    typeof registerSchema
>;

export const loginSchema = z.object({
    email: z
        .string()
        .email("Invalid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;