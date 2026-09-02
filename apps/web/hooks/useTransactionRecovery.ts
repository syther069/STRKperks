"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactionStore } from "../lib/transactions/store";
import { classifyReceipt } from "../lib/transactions/receipt";

export function useTransactionRecovery() {
  const records = useTransactionStore((state) => state.records);
  const update = useTransactionStore((state) => state.update);
  const queryClient = useQueryClient();

  useEffect(() => {
    const pending = records.filter((record) => record.hash && ["submitted", "pending", "unknown"].includes(record.status));
    if (!pending.length) return;
    let cancelled = false;
    const poll = async () => {
      for (const record of pending) {
        const result = await classifyReceipt(record.hash!);
        if (cancelled) return;
        update(record.id, result.status, result.error);
        if (result.status === "accepted") await queryClient.invalidateQueries({ queryKey: ["starknet"] });
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 10_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [queryClient, records, update]);

  return records;
}
