import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_STARKNET_NETWORK: z.enum(["sepolia", "mainnet"]).default("sepolia"),
  NEXT_PUBLIC_STARKNET_RPC_URL: z.string().url().optional(),
  NEXT_PUBLIC_EXPLORER_BASE_URL: z.string().url().default("https://sepolia.voyager.online"),
  NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
  NEXT_PUBLIC_NULLIFIER_REGISTRY_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
  NEXT_PUBLIC_REWARD_ROUTER_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
  NEXT_PUBLIC_STRK20_TOKEN_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
});

export function getPublicEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) throw new Error(`Invalid public environment: ${parsed.error.message}`);
  return parsed.data;
}
