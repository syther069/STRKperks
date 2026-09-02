"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicTransactionRecord, PublicTransactionStatus } from "../types";

type TransactionState = {
  records: PublicTransactionRecord[];
  begin: (record: Omit<PublicTransactionRecord, "id" | "submittedAt" | "updatedAt">) => string;
  attachHash: (id: string, hash: string) => void;
  update: (id: string, status: PublicTransactionStatus, error?: string) => void;
  clearSettled: () => void;
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      records: [],
      begin: (record) => {
        const now = Date.now();
        const id = `${record.chainId}:${record.account}:${now}`;
        set((state) => ({ records: [{ ...record, id, submittedAt: now, updatedAt: now }, ...state.records] }));
        return id;
      },
      attachHash: (id, hash) => set((state) => ({
        records: state.records.map((record) => record.id === id
          ? { ...record, hash, status: "submitted", updatedAt: Date.now() }
          : record),
      })),
      update: (id, status, error) => set((state) => ({
        records: state.records.map((record) => record.id === id
          ? { ...record, status, error, updatedAt: Date.now() }
          : record),
      })),
      clearSettled: () => set((state) => ({
        records: state.records.filter((record) => !["accepted", "reverted", "rejected"].includes(record.status)),
      })),
    }),
    { name: "strkperks-public-transactions", version: 1 },
  ),
);
