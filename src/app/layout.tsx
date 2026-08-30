import type { Metadata } from "next";
import { Fraunces, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { BottomNav } from "@/components/layout/bottom-nav";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "votocerto.ia — Guia das Eleições 2026",
    template: "%s · votocerto.ia",
  },
  description:
    "Guia apartidário para as Eleições Gerais de 2026: conheça candidatos, compare posições e monte sua cola eleitoral com dados oficiais do TSE.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${publicSans.variable} ${plexMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-bg text-text antialiased">
        <AppHeader />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <AppFooter />
        <BottomNav />
      </body>
    </html>
  );
}
