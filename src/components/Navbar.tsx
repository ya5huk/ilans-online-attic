"use client";

import Link from "next/link";
import HeaderText from "./text/HeaderText";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { DM_Serif_Text } from "next/font/google";

const dmSerif = DM_Serif_Text({
  subsets: ["latin"],
  weight: "400",
});

const Navbar: React.FC = () => {
  const pathname = usePathname();

  const getLinkClassname = (path: string): string => {
    // > / | about | pics | projects | yap

    // If its the index page -> activate only when on index
    // If its a blog page or associated with one of the navbar branches - color accordingly
    const isActive = path === "/" ? pathname === path : pathname.includes(path);

    let classname =
      "md:text-2xl px-2 transition-colors duration-200 rounded text-lg tracking-[0.3em] md:tracking-normal";
    classname += " ";
    classname += !isActive
      ? "text-[var(--third)] hover:underline "
      : "text-[var(--bg)]";

    return classname;
  };

  const imageClassname =
    "md:hidden invert mx-2 hover:scale-110 transition-transform duration-200";
  const seperatorClassname =
    "hidden md:block select-none font-bold text-[var(--third)]";

  return (
    <div
      className={`w-full bg-[var(--secondary)] p-4 border-b-8 border-[var(--third)] ${dmSerif.className}`}
    >
      <div className="max-w-2xl mx-auto flex items-center gap-2 justify-between py-2">
        <div className="md:flex items-center w-full justify-between">
          {/* <h3 className="text-6xl">ilan.</h3> */}
          <Link href="/" aria-label="View site's home page">
            <Image
              src="/signature/2-cream-bold.png"
              alt="My Signature"
              width={96}
              height={57.6}
              className="mx-auto mb-4 md:m-0"
            ></Image>
          </Link>
          <div className="flex flex-col md:flex-row items-center md:gap-1">
            <Link href="/" aria-label="View Ilan Yashuk's about page">
              <span className={`${getLinkClassname("/")}` || ""}>about</span>
            </Link>
            <p className={seperatorClassname}>|</p>
            <Link href="/pics" aria-label="View Ilan Yashuk's pictures">
              <span className={`${getLinkClassname("/pics")}` || ""}>
                pic​tures
              </span>
            </Link>
            <p className={seperatorClassname}>|</p>

            <Link href="/projects" aria-label="View Ilan Yashuk's projects">
              <span className={`${getLinkClassname("/projects")}` || ""}>
                projects
              </span>
            </Link>
            <p className={seperatorClassname}>|</p>

            <Link href="/yap" aria-label="View Ilan Yashuk's blog">
              <span className={`${getLinkClassname("/yap")}` || ""}>yap</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
