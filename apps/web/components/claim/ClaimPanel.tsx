import type { Campaign } from "../../lib/types";
import { LivePrivateClaimPanel } from "./LivePrivateClaimPanel";

export function ClaimPanel({ campaign }: { campaign: Campaign }) {
  return <LivePrivateClaimPanel campaign={campaign} />;
}
