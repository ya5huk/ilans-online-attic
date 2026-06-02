import "@/app/globals.css";
import Footer from "@/components/Footer";

// No metadata export here: the root layout supplies the default title/template
// and every page under this group sets its own via generateMetadata, so a title
// here would only double-suffix.
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
