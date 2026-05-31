"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Detail ("inner") pages: /yap/<slug>, /pics/<slug>, /projects/<slug>. The feed
// lists (/, /writing, /images, /projects) are excluded — note /projects (list)
// does NOT match, but /projects/<slug> (detail) does.
const DETAIL_PATTERN = /^\/(yap|pics|projects)\/.+/;

// Where "Go Back" lands when there's no in-app history to pop (e.g. a shared
// link opened cold): the typed feed list for that kind of content.
const fallbackFor = (pathname: string): string => {
  if (pathname.startsWith("/yap/")) return "/writing";
  if (pathname.startsWith("/pics/")) return "/images";
  if (pathname.startsWith("/projects/")) return "/projects";
  return "/";
};

/**
 * Sticky header: the signature logo, tinted to the brand teal via an alpha mask
 * of the (transparent) signature PNG. On detail pages a "← Go Back" sits on the
 * left (the logo stays centred). The bar auto-hides on scroll-down / reveals on
 * scroll-up, and carries a bottom border in the logo's teal.
 *
 * Lives in the root layout, so it persists across client navigations — letting
 * us count in-app navigations to decide whether "back" is safe.
 */
const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [hidden, setHidden] = useState(false);

  // How many in-app navigations have happened since this header mounted (i.e.
  // since the current full page load). >0 means there's a same-site entry to
  // pop. Keyed off actual pathname changes so React StrictMode's double-fired
  // effects in dev don't inflate the count.
  const navCount = useRef(0);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === null) {
      lastPath.current = pathname; // initial render — not a navigation
    } else if (lastPath.current !== pathname) {
      navCount.current += 1;
      lastPath.current = pathname;
    }
  }, [pathname]);

  // Hide when scrolling down, reveal when scrolling up (always shown near top).
  // setHidden with an unchanged value is a no-op, so this stays cheap.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 10) setHidden(false);
      else if (y > lastY) setHidden(true);
      else if (y < lastY) setHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goBack = () => {
    if (navCount.current > 0) router.back();
    else router.push(fallbackFor(pathname));
  };

  const isDetail = DETAIL_PATTERN.test(pathname);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[var(--bg)] border-b border-[var(--third)] transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="relative max-w-3xl mx-auto px-4 py-2 flex items-center justify-center">
        {isDetail && (
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="absolute left-4 flex items-center gap-1 text-sm text-[var(--secondary)] transition-colors hover:text-[var(--third)] hover:cursor-pointer"
          >
            <span aria-hidden>←</span>
            <span>Go Back</span>
          </button>
        )}
        <Link href="/" aria-label="View site's home page">
          <div
            className="h-13 w-28 md:h-15 md:w-36 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "var(--third)",
              WebkitMaskImage: "url(/signature/2-cream-bold.png)",
              maskImage: "url(/signature/2-cream-bold.png)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
