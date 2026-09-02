"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Campaign, ClaimReceipt, PublicTransactionStatus } from "../../lib/types";
import { deriveNullifier } from "../../lib/campaign/nullifier";
import { CONTRACT_ADDRESSES } from "../../lib/utils/constants";
import { formatSTRK } from "../../lib/utils/format";
import { preparePrivateClaim, readShieldedTokenBalance, submitPrivateClaim } from "../../lib/strk20/walletActions";
import { classifyReceipt } from "../../lib/transactions/receipt";
import { useTransactionStore } from "../../lib/transactions/store";
import { readNullifierUsed } from "../../lib/starknet/readCampaign";
import { useStrk20Wallet } from "../wallet/Strk20WalletProvider";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { RecipientReceipt } from "./RecipientReceipt";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForTerminalReceipt(
  hash: string,
  onStatus: (status: PublicTransactionStatus, error?: string) => void,
  timeoutMs = 120_000,
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await classifyReceipt(hash);
    onStatus(result.status, result.error);
    if (["accepted", "reverted", "rejected"].includes(result.status)) return result;
    await sleep(4_000);
  }
  const result = { status: "unknown" as const, error: "Confirmation timed out; transaction remains submitted" };
  onStatus(result.status, result.error);
  return result;
}

export function LivePrivateClaimPanel({ campaign }: { campaign: Campaign }) {
  const wallet = useStrk20Wallet();
  const [conversionId, setConversionId] = useState("");
  const [claimSecret, setClaimSecret] = useState("");
  const [expiry, setExpiry] = useState(() => String(Math.floor(Date.now() / 1000) + 3600));
  const [noteId, setNoteId] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState<string | null>(null);
  const [busy, setBusy] = useState<"prepare" | "submit" | "balance" | "replay" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ClaimReceipt | null>(null);
  const [replayEvidence, setReplayEvidence] = useState<string | null>(null);

  const campaignAddress = campaign.contractAddress || campaign.id;
  const nullifier = claimSecret ? deriveNullifier(campaignAddress, claimSecret) : "";

  const params = () => {
    if (!wallet.account || !wallet.address || !wallet.chainId) throw new Error("Connect a privacy-aware wallet on Starknet Sepolia");
    if (!conversionId.trim() || !claimSecret.trim()) throw new Error("Conversion ID and local app secret are required");
    if (!/^\d+$/.test(expiry) || BigInt(expiry) <= BigInt(Math.floor(Date.now() / 1000))) throw new Error("Authorization expiry must be a future Unix timestamp");
    if (!campaign.routerAddress || BigInt(campaign.routerAddress) === 0n) throw new Error("This campaign has no verified STRK20 router");
    if (!CONTRACT_ADDRESSES.strkToken) throw new Error("Verified reward token is not configured");
    return {
      anonymizerAddress: campaign.routerAddress,
      rewardToken: CONTRACT_ADDRESSES.strkToken,
      claimantAddress: wallet.address,
      conversionId: conversionId.trim(),
      nullifier,
      authorizationExpiry: expiry,
    };
  };

  const resetPrepared = () => {
    setNoteId(null);
    setReceipt(null);
    setReplayEvidence(null);
    setBaseline(null);
    setCurrentBalance(null);
  };

  const prepare = async () => {
    setBusy("prepare");
    setError(null);
    try {
      setNoteId((await preparePrivateClaim(wallet.account!, params(), true)).noteId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Preparation failed");
    } finally {
      setBusy(null);
    }
  };

  const readBalance = async () => {
    setBusy("balance");
    setError(null);
    try {
      if (!wallet.account) throw new Error("Connect the privacy wallet first");
      const value = await readShieldedTokenBalance(wallet.account, CONTRACT_ADDRESSES.strkToken);
      if (!receipt) setBaseline(value);
      setCurrentBalance(value);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Wallet balance request failed");
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    if (!noteId) return;
    setBusy("submit");
    setError(null);
    const id = useTransactionStore.getState().begin({ chainId: wallet.chainId || "SN_SEPOLIA", account: wallet.address || "", action: "private_claim", target: campaignAddress, status: "awaiting_wallet" });
    let hash = "";
    try {
      const result = await submitPrivateClaim(wallet.account!, params(), noteId);
      hash = result.transactionHash;
      useTransactionStore.getState().attachHash(id, hash);
      setReceipt({ id: `claim:${hash}`, campaignId: campaignAddress, campaignName: campaign.name, rewardAmount: campaign.rewardAmount, tokenSymbol: campaign.tokenSymbol, conversionId, nullifier, recipientNoteHash: result.noteId, txHash: hash, timestamp: Math.floor(Date.now() / 1000), status: "submitted", shieldedBalanceVerified: false, source: "starknet" });
      const terminal = await waitForTerminalReceipt(hash, (status, detail) => useTransactionStore.getState().update(id, status, detail));
      if (terminal.status === "accepted") {
        if (!(await readNullifierUsed(campaignAddress, nullifier))) throw new Error("Receipt accepted but the campaign nullifier is not consumed");
        setReceipt((current) => (current ? { ...current, status: "settled" } : current));
      } else if (terminal.status === "unknown") {
        setError(`Confirmation timed out. ${hash} remains recoverable from Activity.`);
      } else {
        throw new Error(terminal.error || `Claim ${terminal.status}`);
      }
    } catch (cause) {
      if (!hash) useTransactionStore.getState().update(id, "rejected", cause instanceof Error ? cause.message : "Wallet rejected claim");
      setError(cause instanceof Error ? cause.message : "Private claim failed");
    } finally {
      setBusy(null);
    }
  };

  const replay = async () => {
    if (!noteId || !wallet.account) return;
    setBusy("replay");
    setReplayEvidence(null);
    setError(null);
    const id = useTransactionStore.getState().begin({ chainId: wallet.chainId || "SN_SEPOLIA", account: wallet.address || "", action: "duplicate_private_claim", target: campaignAddress, status: "awaiting_wallet" });
    let hash = "";
    try {
      const result = await submitPrivateClaim(wallet.account, params(), noteId);
      hash = result.transactionHash;
      useTransactionStore.getState().attachHash(id, hash);
      const terminal = await waitForTerminalReceipt(hash, (status, detail) => useTransactionStore.getState().update(id, status, detail));
      if (terminal.status === "accepted") {
        setReplayEvidence(`SECURITY FAILURE: exact replay ${hash} was accepted. Stop submission and investigate.`);
      } else if (terminal.status === "reverted" || terminal.status === "rejected") {
        setReplayEvidence(`Onchain replay evidence: ${hash} finished ${terminal.status}. ${terminal.error || ""}`);
      } else {
        setReplayEvidence(`Replay transaction ${hash} remains unconfirmed. Activity will resume receipt polling.`);
      }
    } catch (cause) {
      useTransactionStore.getState().update(id, "rejected", cause instanceof Error ? cause.message : "Wallet preflight rejected replay");
      const used = await readNullifierUsed(campaignAddress, nullifier).catch(() => false);
      setReplayEvidence(`${used ? "Registry confirms the campaign nullifier is consumed. " : "Registry confirmation unavailable. "}Wallet preflight/simulation rejected the exact replay before submission: ${cause instanceof Error ? cause.message : "unknown error"}`);
    } finally {
      setBusy(null);
    }
  };

  const balanceDeltaVerified = baseline !== null && currentBalance !== null && BigInt(currentBalance) > BigInt(baseline);

  if (receipt) {
    return (
      <div className="space-y-4">
        <RecipientReceipt receipt={{ ...receipt, status: balanceDeltaVerified ? "shielded_note_ready" : receipt.status, shieldedBalanceVerified: balanceDeltaVerified }} onClose={resetPrepared} />
        <Card className="space-y-3">
          <h2 className="font-semibold">Wallet and replay evidence</h2>
          <p className="text-xs leading-5 text-fg-secondary">Receipt acceptance proves public execution. A separate, consented wallet balance read is required before claiming a private balance increase.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={readBalance} isLoading={busy === "balance"}>Refresh privacy balance</Button>
            {receipt.status !== "submitted" && <Button variant="danger" onClick={replay} isLoading={busy === "replay"}>Submit exact replay</Button>}
          </div>
          {baseline !== null && <p className="font-mono text-xs text-fg-muted">Baseline {baseline} · Current {currentBalance}</p>}
          {balanceDeltaVerified && <p className="flex items-center gap-2 text-xs text-status-success"><CheckCircle2 className="size-4" />Wallet reported a higher private token balance.</p>}
          {replayEvidence && <p className="rounded border border-border bg-bg-raised p-3 text-xs leading-5 text-fg-secondary">{replayEvidence}</p>}
          {error && <p className="text-xs text-status-warning">{error}</p>}
        </Card>
      </div>
    );
  }

  return (
    <Card className="space-y-6">
      <div className="flex justify-between gap-4 border-b border-border pb-4">
        <div><p className="text-xs text-brand-privacy">Privacy-aware claim</p><h1 className="mt-1 text-xl font-semibold">{campaign.name}</h1><p className="mt-2 text-xs leading-5 text-fg-secondary">Token, amount, app nullifier, conversion, open-note output, and timing remain public. The compatible wallet owns proving and note discovery.</p></div>
        <ShieldCheck className="size-5 text-brand-privacy" />
      </div>
      <div className="rounded border border-border bg-bg-raised p-4"><p className="text-xs text-fg-muted">Reward</p><p className="mt-1 font-mono text-2xl text-brand-reward">{formatSTRK(campaign.rewardAmount)} {campaign.tokenSymbol}</p></div>
      {error && <p role="alert" className="flex gap-2 rounded border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error"><AlertCircle className="size-4" />{error}</p>}
      <div className="space-y-4">
        <Input label="Conversion ID" value={conversionId} onChange={(event) => { setConversionId(event.target.value); resetPrepared(); }} isMono />
        <Input label="Local app-nullifier secret" type="password" value={claimSecret} onChange={(event) => { setClaimSecret(event.target.value); resetPrepared(); }} helperText="Held in browser memory only. It is not a viewing key." isMono />
        <Input label="Authorization expiry" value={expiry} onChange={(event) => { setExpiry(event.target.value); resetPrepared(); }} isMono />
        {nullifier && <div className="rounded border border-border bg-bg-raised p-3"><p className="text-[10px] text-fg-muted">PUBLIC APP NULLIFIER</p><p className="mt-1 break-all font-mono text-xs">{nullifier}</p></div>}
        {noteId && <div className="rounded border border-brand-privacy/30 bg-brand-privacy-subtle p-3"><p className="text-xs font-semibold text-brand-privacy">Prepared—not submitted</p><p className="mt-2 break-all font-mono text-xs">{noteId}</p><p className="mt-2 text-xs text-fg-secondary">The owner must approve this exact note ID, conversion, app nullifier, and expiry onchain.</p></div>}
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={prepare} disabled={!wallet.supported || busy !== null} isLoading={busy === "prepare"}>{wallet.supported ? "Prepare exact note" : "Connect compatible wallet"}</Button>
          <Button variant="reward" onClick={submit} disabled={!noteId || busy !== null} isLoading={busy === "submit"}>Submit private claim</Button>
        </div>
        {noteId && <div className="rounded border border-border p-3"><p className="text-xs leading-5 text-fg-secondary">Optional evidence step: record the wallet-reported private balance before submission, then refresh it after acceptance.</p><Button className="mt-2" variant="ghost" size="sm" onClick={readBalance} isLoading={busy === "balance"}>{baseline === null ? "Record privacy balance baseline" : `Baseline recorded: ${baseline}`}</Button></div>}
      </div>
    </Card>
  );
}
