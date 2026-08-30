import { z } from "zod";

export const campaignFormSchema = z.object({
  name: z
    .string()
    .min(3, "Campaign name must be at least 3 characters")
    .max(64, "Campaign name cannot exceed 64 characters"),
  description: z
    .string()
    .min(10, "Please provide a clear description of at least 10 characters")
    .max(300, "Description cannot exceed 300 characters"),
  rewardAmount: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Reward amount must be a positive number"
    ),
  maxClaims: z
    .string()
    .refine(
      (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 1,
      "Maximum claims must be at least 1"
    ),
  durationDays: z
    .string()
    .refine(
      (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 365,
      "Duration must be between 1 and 365 days"
    ),
  nullifierNamespace: z
    .string()
    .min(3, "Namespace must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Namespace can only contain letters, numbers, and dashes"),
});

export type CampaignFormData = z.infer<typeof campaignFormSchema>;
