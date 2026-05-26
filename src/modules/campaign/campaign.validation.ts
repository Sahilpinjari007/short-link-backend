import z from "zod";

export const createCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  clicksGoal: z.number().optional(),
  color: z.string().optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  clicksGoal: z.number().optional(),
  color: z.string().optional(),
});
