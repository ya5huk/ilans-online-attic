import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Ilan's Online Attic",
  description: "Everything's ilan.",
};

export default function PathsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section>
      <div className="mx-auto max-w-3xl px-4 py-4 md:px-0">{children}</div>
      <Footer />
    </section>
  );
}
