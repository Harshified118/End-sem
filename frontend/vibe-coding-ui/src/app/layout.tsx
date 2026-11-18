import type { Metadata } from "next";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "DropOrCop | Sneaker Resale Profit Arbitrage Predictor",
  description:
    "Machine learning resale valuation engine predicting StockX market prices and COP/DROP verdicts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#090a0f] text-slate-100">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
