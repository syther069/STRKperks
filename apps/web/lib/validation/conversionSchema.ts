import { z } from "zod";

export const conversionApprovalSchema = z.object({
  conversionId: z
    .string()
    .min(4, "Conversion ID must be at least 4 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Conversion ID can only contain alphanumeric and dash characters"),
  recipientCommitment: z
    .string()
    .min(10, "Valid recipient commitment hash is required")
    .regex(/^0x[0-9a-fA-F]+$/, "Commitment must be a valid hex string starting with 0x"),
  rewardTier: z.string().default("standard"),
  expiresInDays: z
    .string()
    .refine(
      (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 90,
      "Expiry must be between 1 and 90 days"
    ),
});

export type ConversionApprovalData = z.infer<typeof conversionApprovalSchema>;

export const claimRewardSchema = z.object({
  conversionId: z.string().min(1, "Conversion ID is required"),
  recipientSecret: z.string().min(6, "Recipient secret/key is required"),
});

export type ClaimRewardData = z.infer<typeof claimRewardSchema>;
