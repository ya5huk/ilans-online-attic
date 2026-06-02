import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

// Headers — Outfit (geometric sans). A single variable font covers the
// 100–900 weight range, self-hosted via next/font. Exposed as --font-outfit.
const outfit = localFont({
  src: "./fonts/Outfit-Variable.woff2",
  weight: "100 900",
  variable: "--font-outfit",
  display: "swap",
});

// Content + UI — Poppins (geometric sans). Self-hosted by next/font at build
// time; Poppins isn't a variable font, so the weights used across body copy and
// UI chrome are listed explicitly (normal + italic). Exposed as --font-poppins.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves relative OpenGraph/Twitter image URLs (e.g. "/blog-images/…") to
  // absolute canonical URLs; without it Next can't build correct social-preview
  // image links and logs a build warning.
  metadataBase: new URL("https://www.ilansonlineattic.com"),
  // Per-page titles render as "<Page> · Ilan's Online Attic"; pages that ARE the
  // brand (home) opt out with an absolute title.
  title: {
    default: "Ilan's Online Attic",
    template: "%s · Ilan's Online Attic",
  },
  description: "Everything's ilan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${poppins.variable} flex min-h-screen flex-col`}
      >
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
