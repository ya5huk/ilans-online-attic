"use client";

import Link from "next/link";
import HeaderText from "./text/HeaderText";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const getLinkClassname = (path: string): string => {
    const pathname = usePathname();
    // > / | about | pics | projects | yap

    // If its the index page -> activate only when on index
    // If its a blog page or associated with one of the navbar branches - color accordingly
    const isActive = path === "/" ? pathname === path : pathname.includes(path);

    let classname =
      "md:text-3xl px-2 py-1 transition-colors duration-100 rounded text-lg";
    classname += " ";
    classname += !isActive
      ? "text-[var(--third)] hover:underline hover:bg-[var(--bg)]"
      : "text-[var(--bg)]";

    return classname;
  };

  const imageClassname =
    "md:hidden invert mx-2 hover:scale-110 transition-transform duration-200";
  const seperatorClassname =
    "hidden md:block select-none font-bold text-[var(--third)]";

  return (
    <div className="w-full bg-[var(--secondary)] p-4 border-b-8 border-[var(--third)] font-dm-serif">
      <div className="max-w-3xl mx-auto flex items-center gap-2 justify-between py-2">
        <div className="flex items-center gap-4">
          {/* <Image
            src="/me/IMG_3463.jpg"
            alt="Me climbing on some red and white pole"
            width={100}
            height={100}
            className="rounded-full border-4 border-[var(--third)]"
          ></Image> */}
        </div>
        <div className="flex items-center w-full justify-between">
          {/* <h3 className="text-6xl">ilan.</h3> */}
          <Image
            src="/signature/2.png"
            alt="My Signature"
            width={1000}
            height={1000}
            className="invert h-18 w-24 "
            style={{ filter: "invert(100%)" }}
          ></Image>
          <div className="flex flex-col md:flex-row items-center md:gap-1">
            <Link href="/">
              {/* For large screens - show text */}
              <span className={`${getLinkClassname("/")}`}>about</span>
            </Link>
            <p className={seperatorClassname}>|</p>
            <Link href="/pics">
              <span className={`${getLinkClassname("/pics")}`}>pic​tures</span>
            </Link>
            <p className={seperatorClassname}>|</p>

            <Link href="/projects">
              <span className={`${getLinkClassname("/projects")}`}>
                projects
              </span>
            </Link>
            <p className={seperatorClassname}>|</p>

            <Link href="/yap">
              <span className={`${getLinkClassname("/yap")}`}>yap</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
