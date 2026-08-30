import "./globals.css";
import type { Metadata } from "next";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "StrkPerks | Starknet-Native Private Rewards & Referral Settlement",
  description:
    "Confidential reward and referral distribution protocol on Starknet using STRK20 shielded balance flows and campaign-scoped nullifier replay protection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-fg-primary antialiased flex flex-col min-h-screen">
        <WalletProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
