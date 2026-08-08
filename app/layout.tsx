import type { Metadata } from "next";
import { Press_Start_2P, Saira, Azeret_Mono } from "next/font/google";
import "./globals.css";

const pixelify = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

// squarish grotesque: flat terminals and a rectangular skeleton echo the pixel
// face's grid, while staying a real text face at paragraph sizes
const saira = Saira({
  subsets: ["latin"],
  variable: "--font-body",
});

// squared-off mono whose figures sit on the same grid logic as the pixel type
const azeretMono = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Blackjack Martingale Simulator",
  description:
    "Monte Carlo simulation lab for blackjack betting strategies and bankroll risk analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pixelify.variable} ${saira.variable} ${azeretMono.variable} antialiased`}
      >
        {/*
          THESIS: This page deals you a real hand instead of describing one. It refuses the
          centered-title-and-button splash the category always ships.
          OWN-WORLD: The incumbent world, unchanged and pinned by the user: #0a0e13 ground, mint
          #36d6a8, gold #f0c24a, loss red #e8446c, Press Start 2P display, JetBrains Mono figures,
          the project's own pixel card and chip sprites on green felt, hard-offset arcade shadows.
          STORY: A martingale looks unbeatable for ninety hands. The visitor watches it work, sees
          the curve, sees how many bankrolls it killed, and goes to try it.
          FIRST VIEWPORT: Full-bleed felt table. Rules placard top-left carrying the product name,
          a real engine-dealt hand playing at center, live bankroll HUD right, CTA chip in the
          betting circle.
          FORM: Page-as-shoe, candidate 3 of 7, surface seed key 400e0a43.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        {children}
      </body>
    </html>
  );
}
