import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarbonRush AI — Autonomous Carbon Verification & Tokenization",
  description:
    "AI-powered carbon verification, blockchain-backed transparency, and tokenized carbon markets for blue carbon ecosystems. Building the trust layer for carbon.",
  keywords: [
    "carbon credits",
    "blue carbon",
    "AI verification",
    "blockchain",
    "climate tech",
    "carbon marketplace",
    "mangrove restoration",
    "ESG",
    "carbon offset",
    "tokenization",
  ],
  openGraph: {
    title: "CarbonRush AI — Building the Trust Layer for Carbon",
    description:
      "AI-powered autonomous carbon verification and tokenization network for blue carbon ecosystems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0F172A] text-[#F1F5F9]">
        {children}
      </body>
    </html>
  );
}
