import z, { string } from "zod";

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, "Original URL cannot be empty")
    .url("Invalid URL"),
  domain: z.string().trim().min(1, "Domain cannot be empty"),
  title: z.string().optional(),
  customCode: z.string().trim().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),
  campaignId: z.string().optional(),
});

export const verifyLinkPasswordSchema = z.object({
  shortCode: string(),
  password: string(),
});


export const updateLinkSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, "Original URL cannot be empty")
    .url("Invalid URL")
    .optional(),
  domain: z.string().trim().min(1, "Domain cannot be empty").optional(),
  customeCode: z.string().trim().optional(),
  title: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  password: z.string().optional(),
  campaignId: z.string().optional(),
});
