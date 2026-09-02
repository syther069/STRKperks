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

export function ConversionApprovalTable({ campaign }: { campaign: Campaign }) {
  const actions = useContractActions();
  const { address: connectedAddress } = useAccount();
  const isOwner = Boolean(connectedAddress && BigInt(connectedAddress) === BigInt(campaign.ownerAddress));
  const [conversionId, setConversionId] = useState("");
  const [nullifier, setNullifier] = useState("");
  const [noteId, setNoteId] = useState("");
  const [expiry, setExpiry] = useState("");
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null); setHash(null);
    try { setHash(await actions.approveClaim(campaign.contractAddress || campaign.id, conversionId, nullifier, noteId, expiry)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Approval failed"); }
    finally { setBusy(false); }
  };
  const url = hash ? getExplorerTxUrl(hash) : null;
  const cancel = async () => {
    setBusy(true); setError(null);
    try { setHash(await actions.cancelClaim(campaign.contractAddress || campaign.id, conversionId, nullifier, noteId, expiry)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Cancellation failed"); }
    finally { setBusy(false); }
  };
  const complete = conversionId && nullifier && noteId && expiry;
  return <Card className="space-y-5"><div><h2 className="font-semibold text-fg-primary">Approve exact conversion</h2><p className="mt-1 text-xs leading-5 text-fg-secondary">All fields are public and must match the claimant wallet’s prepared request exactly.</p></div>{error && <p role="alert" className="rounded border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">{error}</p>}{hash && <p className="rounded border border-status-success/30 bg-status-success/10 p-3 text-xs text-status-success">Confirmed owner action {url && <a href={url} target="_blank" rel="noreferrer" className="ml-2 font-mono underline">{shortenHash(hash, 7)}</a>}</p>}<form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Input label="Conversion ID" value={conversionId} onChange={(e) => setConversionId(e.target.value)} isMono /><Input label="Authorization expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="Unix seconds" isMono /><div className="sm:col-span-2"><Input label="Campaign app nullifier" value={nullifier} onChange={(e) => setNullifier(e.target.value)} placeholder="0x…" isMono /></div><div className="sm:col-span-2"><Input label="Wallet-prepared open-note ID" value={noteId} onChange={(e) => setNoteId(e.target.value)} placeholder="0x…" isMono /></div><div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={!actions.isReady || !isOwner || busy || !complete} isLoading={busy}>Approve conversion</Button><Button type="button" variant="danger" onClick={cancel} disabled={!actions.isReady || !isOwner || busy || !complete}>Cancel exact approval</Button></div></form>{!isOwner && <p className="text-xs text-fg-muted">Connect the campaign owner wallet to approve or cancel.</p>}</Card>;
}
