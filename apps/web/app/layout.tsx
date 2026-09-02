import "./globals.css";
import type { Metadata } from "next";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "StrkPerks | Starknet Reward Settlement",
  description:
    "Starknet reward and referral campaigns with onchain STRK funding, campaign-scoped nullifier replay protection, and a documented STRK20 adapter boundary.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className="font-sans bg-bg text-fg-primary antialiased flex min-h-dvh flex-col"
      >
        <WalletProvider>
          <Navbar />
          <main className="flex-1 md:ml-60">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
          </main>
          <div className="md:ml-60"><Footer /></div>
        </WalletProvider>
      </body>
    </html>
  );
}
