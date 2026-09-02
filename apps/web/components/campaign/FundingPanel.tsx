"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import type { Campaign } from "../../lib/types";
import { useContractActions } from "../../lib/starknet/useContractActions";
import { getExplorerTxUrl } from "../../lib/starknet/explorer";
import { formatSTRK, shortenHash } from "../../lib/utils/format";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

export function FundingPanel({ campaign }: { campaign: Campaign }) {
  const actions = useContractActions();
  const { address: connectedAddress } = useAccount();
  const isOwner = Boolean(connectedAddress && BigInt(connectedAddress) === BigInt(campaign.ownerAddress));
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState<"idle" | "approving" | "funding">("idle");
  const [hashes, setHashes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const address = campaign.contractAddress || campaign.id;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(null); setHashes([]); setStage("approving");
    try {
      const result = await actions.fundCampaign(address, amount, (next, hash) => {
        setStage(next); if (hash) setHashes((current) => current.includes(hash) ? current : [...current, hash]);
      });
      setHashes(result.hashes);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Funding failed"); }
    finally { setStage("idle"); }
  };
  const cancelApproval = async () => {
    setError(null); setStage("approving");
    try {
      const cancellationHash = await actions.cancelFundingApproval(address);
      setHashes((current) => [...current, cancellationHash]);
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Approval cancellation failed"); }
    finally { setStage("idle"); }
  };
  return <Card className="space-y-5"><div><h2 className="font-semibold text-fg-primary">Fund reward pool</h2><p className="mt-1 text-xs leading-5 text-fg-secondary">Funding is public. Approval must confirm before the campaign pulls tokens.</p></div><dl className="grid grid-cols-2 gap-4 border-y border-border py-4 text-xs"><div><dt className="text-fg-muted">Available</dt><dd className="mt-1 font-mono text-brand-reward">{formatSTRK(campaign.remainingBudget)}</dd></div><div><dt className="text-fg-muted">Asset</dt><dd className="mt-1 font-mono text-fg-primary">{campaign.tokenSymbol}</dd></div></dl>
    {error && <p className="rounded border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error" role="alert">{error}</p>}
    {hashes.length > 0 && <ol className="space-y-2">{hashes.map((hash, index) => { const url = getExplorerTxUrl(hash); return <li key={hash} className="flex items-center justify-between rounded border border-border p-3 text-xs"><span>{index === 0 ? "Token approval" : "Campaign funding"}</span>{url && <a href={url} target="_blank" rel="noreferrer" className="font-mono text-brand-privacy">{shortenHash(hash, 6)}</a>}</li>; })}</ol>}
    <form onSubmit={submit} className="space-y-3"><Input label="Funding amount" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="100" isMono rightElement={<span className="text-xs">{campaign.tokenSymbol}</span>} /><Button type="submit" className="w-full" disabled={!actions.isReady || !isOwner || stage !== "idle" || !amount} isLoading={stage !== "idle"}>{!actions.isReady || !isOwner ? "Connect campaign owner on Sepolia" : stage === "approving" ? "Confirming approval" : stage === "funding" ? "Confirming funding" : "Fund reward pool"}</Button></form>
    {error && hashes.length === 1 && <Button variant="ghost" size="sm" disabled={stage !== "idle"} onClick={cancelApproval}>Set remaining token allowance to zero</Button>}
  </Card>;
}
