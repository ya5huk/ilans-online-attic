import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ilan's Online Attic",
  description: "Everything's ilan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="mx-auto max-w-3xl mt-4 mb-12">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
