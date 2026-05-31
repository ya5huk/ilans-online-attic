import type { Metadata } from "next";
import "@/app/globals.css";
import Footer from "@/components/Footer";

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
    <section className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 md:px-0">
        {children}
      </div>
      <Footer />
    </section>
  );
}
