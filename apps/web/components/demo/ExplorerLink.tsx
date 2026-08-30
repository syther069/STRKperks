import React from "react";
import { getExplorerTxUrl, getExplorerContractUrl } from "../../lib/starknet/explorer";
import { shortenHash, shortenAddress } from "../../lib/utils/format";
import { ExternalLink } from "lucide-react";

export interface ExplorerLinkProps {
  type: "tx" | "contract";
  value: string;
  label?: string;
  className?: string;
}

export function ExplorerLink({ type, value, label, className }: ExplorerLinkProps) {
  const url = type === "tx" ? getExplorerTxUrl(value) : getExplorerContractUrl(value);
  const display = label || (type === "tx" ? shortenHash(value, 6) : shortenAddress(value, 4));

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1 font-mono text-brand-privacy hover:underline text-xs ${className}`}
    >
      <span>{display}</span>
      <ExternalLink className="w-3 h-3 shrink-0" />
    </a>
  );
}
