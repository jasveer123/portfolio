import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono, Caveat } from "next/font/google";
import { AppProviders } from "./components/site/app-providers";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Jasveer Singh — Frontend Engineer",
  description:
    "Portfolio of Jasveer Singh — Frontend Engineer with 4.5+ years building high-performance interfaces for research platforms, AI products, and fintech.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} ${caveat.variable} transition-colors duration-500`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
