"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import type { Campaign } from "../../lib/types";
import { useContractActions } from "../../lib/starknet/useContractActions";
import { getExplorerTxUrl } from "../../lib/starknet/explorer";
import { shortenHash } from "../../lib/utils/format";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

export function CampaignControls({ campaign }: { campaign: Campaign }) {
  const actions = useContractActions();
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const campaignAddress = campaign.contractAddress || campaign.id;
  const isOwner = Boolean(address && BigInt(address) === BigInt(campaign.ownerAddress));
  const run = async (operation: () => Promise<string>) => {
    setBusy(true); setError(null); setHash(null);
    try { setHash(await operation()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Campaign action failed"); }
    finally { setBusy(false); }
  };
  const explorer = hash ? getExplorerTxUrl(hash) : null;

  return (
    <Card className="space-y-4">
      <div><h2 className="font-semibold">Campaign controls</h2><p className="mt-1 text-xs text-fg-secondary">Owner-only lifecycle actions. Each action waits for a confirmed receipt and refreshes Starknet state.</p></div>
      {error && <p role="alert" className="text-xs text-status-error">{error}</p>}
      {explorer && <a href={explorer} target="_blank" rel="noreferrer" className="font-mono text-xs text-brand-privacy">Confirmed {shortenHash(hash!, 7)}</a>}
      <div className="flex flex-wrap gap-2">
        {campaign.status === "paused"
          ? <Button variant="secondary" disabled={!isOwner || busy} onClick={() => void run(() => actions.resumeCampaign(campaignAddress))}>Resume</Button>
          : <Button variant="secondary" disabled={!isOwner || busy || campaign.status === "closed"} onClick={() => void run(() => actions.pauseCampaign(campaignAddress))}>Pause</Button>}
        <Button variant="danger" disabled={!isOwner || busy || campaign.status === "closed"} onClick={() => void run(() => actions.closeCampaign(campaignAddress))}>Close campaign</Button>
      </div>
      {campaign.status === "closed" && (
        <form className="space-y-3 border-t border-border pt-4" onSubmit={(event) => { event.preventDefault(); void run(() => actions.withdrawUnspent(campaignAddress, recipient, amount)); }}>
          <Input label="Withdrawal recipient" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x…" isMono />
          <Input label="Unspent amount" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1" isMono />
          <Button type="submit" variant="secondary" disabled={!isOwner || busy || !recipient || !amount}>Withdraw unspent tokens</Button>
        </form>
      )}
      {!isOwner && <p className="text-xs text-fg-muted">Connect the campaign owner wallet to manage lifecycle or recover unspent funds.</p>}
    </Card>
  );
}
