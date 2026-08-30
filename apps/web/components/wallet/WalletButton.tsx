"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect, useNetwork } from "@starknet-react/core";
import { useDemoStore } from "../../lib/store/demoStore";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { shortenAddress, formatSTRK } from "../../lib/utils/format";
import { Wallet, LogOut, ChevronDown, Check, Shield, Layers } from "lucide-react";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const {
    isDemoMode,
    simulatedWalletConnected,
    simulatedAddress,
    simulatedBalanceSTRK,
    toggleWalletConnection,
  } = useDemoStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Active address determination
  const activeAddress = isConnected
    ? address
    : simulatedWalletConnected
    ? simulatedAddress
    : null;

  const isAnyConnected = isConnected || simulatedWalletConnected;

  return (
    <>
      <div className="relative">
        {!isAnyConnected ? (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Wallet className="w-4 h-4" />}
            onClick={() => setIsOpen(true)}
          >
            Connect Wallet
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-btn bg-bg-raised border border-border hover:border-border-hover transition-colors cursor-pointer text-xs"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                <span className="font-mono text-fg-primary font-medium">
                  {shortenAddress(activeAddress || "", 4)}
                </span>
              </div>
              <div className="h-3.5 w-px bg-border" />
              <span className="font-mono text-brand-reward font-semibold">
                {formatSTRK(simulatedBalanceSTRK)} STRK
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-fg-muted" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 rounded-card bg-bg-raised border border-border p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="space-y-2 pb-2 mb-2 border-b border-border text-xs">
                    <div className="text-fg-muted uppercase tracking-wider font-semibold text-[10px]">
                      Connected Network
                    </div>
                    <div className="flex items-center justify-between font-mono text-fg-primary">
                      <span>{chain?.name || "Starknet Sepolia"}</span>
                      <span className="px-1.5 py-0.5 rounded bg-brand-privacy-subtle text-brand-privacy text-[10px]">
                        SN_SEPOLIA
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        if (isConnected) {
                          disconnect();
                        } else {
                          toggleWalletConnection(false);
                        }
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs text-status-error hover:bg-status-error/10 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Connect Starknet Wallet"
        description="Select your Starknet wallet or use the Demo simulation wallet."
        maxWidth="sm"
      >
        <div className="space-y-3">
          <div className="space-y-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-btn bg-bg-surface border border-border hover:border-brand-primary hover:bg-bg-subtle transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-bg-raised border border-border">
                    <Wallet className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-fg-primary">
                      {connector.name}
                    </div>
                    <div className="text-[11px] text-fg-muted font-mono">
                      Starknet Native
                    </div>
                  </div>
                </div>
                <span className="text-xs text-brand-primary font-medium">Connect</span>
              </button>
            ))}

            {/* Quick Demo Wallet connector */}
            <button
              onClick={() => {
                toggleWalletConnection(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-btn bg-brand-primary-subtle/30 border border-brand-primary/40 hover:bg-brand-primary-subtle/50 transition-all cursor-pointer text-left mt-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-brand-primary/20">
                  <Shield className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-fg-primary">
                    Judge Demo Wallet
                  </div>
                  <div className="text-[11px] text-fg-muted">
                    Pre-funded Starknet Sepolia Account
                  </div>
                </div>
              </div>
              <span className="text-xs text-brand-reward font-semibold">Simulate</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
