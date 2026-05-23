import z from "zod";

export const createQrSchema = z.object({
  targetUrl: z
    .string()
    .trim()
    .min(1, "Target URL cannot be empty")
    .url("Invalid URL"),
  title: z.string().min(1, "Title cannot be empty").optional(),
  domain: z.string().trim().min(1, "Domain cannot be empty"),
  foregroundColor: z.string().optional(),
  backgroundColor: z.string().optional(),
});

export const updateQrSchema = z.object({
  targetUrl: z
    .string()
    .trim()
    .min(1, "Target URL cannot be empty")
    .url("Invalid URL")
    .optional(),
  title: z.string().min(1, "Title cannot be empty").optional(),
  domain: z.string().trim().min(1, "Domain cannot be empty").optional(),
  foregroundColor: z.string().optional(),
  backgroundColor: z.string().optional(),
});
