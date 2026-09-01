import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_STARKNET_NETWORK: z.enum(["sepolia", "mainnet"]).default("sepolia"),
  NEXT_PUBLIC_STARKNET_RPC_URL: z.string().url().optional(),
  NEXT_PUBLIC_EXPLORER_BASE_URL: z.string().url().default("https://sepolia.voyager.online"),
  NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
  NEXT_PUBLIC_NULLIFIER_REGISTRY_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
  NEXT_PUBLIC_REWARD_ROUTER_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
  NEXT_PUBLIC_REWARD_CAMPAIGN_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
  NEXT_PUBLIC_REWARD_TOKEN_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
  NEXT_PUBLIC_STRK20_TOKEN_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
  NEXT_PUBLIC_STRK20_PRIVACY_POOL_ADDRESS: z.string().regex(/^0x[0-9a-f]+$/i).optional(),
}).superRefine((env, ctx) => {
  if (env.NEXT_PUBLIC_STARKNET_NETWORK === "sepolia" && /mainnet/i.test(env.NEXT_PUBLIC_STARKNET_RPC_URL || "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["NEXT_PUBLIC_STARKNET_RPC_URL"], message: "Sepolia cannot use a mainnet RPC URL" });
  }
  if (env.NEXT_PUBLIC_STARKNET_NETWORK === "mainnet" && /sepolia|testnet/i.test(env.NEXT_PUBLIC_STARKNET_RPC_URL || "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["NEXT_PUBLIC_STARKNET_RPC_URL"], message: "Mainnet cannot use a Sepolia/testnet RPC URL" });
  }
});

export function getPublicEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) throw new Error(`Invalid public environment: ${parsed.error.message}`);
  return parsed.data;
}
