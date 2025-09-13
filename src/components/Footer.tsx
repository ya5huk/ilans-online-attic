"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Footer: React.FC = () => {
  const [theme, setTheme] = useState("leaves");

  // on hover -> Make image larger

  const imageClassname =
    "transition-transform duration-250 hover:scale-110 invert";

  const themeButtonClassname =
    "hover:cursor-pointer transition-transform duration-250 invert scale-60";
  const selectedThemeButtonClassname = themeButtonClassname + " scale-110";

  const changeTheme = (themename: string) => {
    setTheme(themename);
    document.documentElement.setAttribute("data-theme", themename);
  };

  return (
    <div className="w-full bg-[var(--secondary)] py-6 p-3 md:p-8">
      <div className="md:px-4 max-w-3xl mx-auto flex justify-between items-center">
        <div className="flex justify-center items-center gap-1 md:gap-2">
          {" "}
          <Image
            className={
              theme === "leaves"
                ? selectedThemeButtonClassname
                : themeButtonClassname
            }
            src="/ui/leaves.png"
            alt="Change website theme to forest."
            width={35}
            height={35}
            onClick={() => changeTheme("leaves")}
          />
          <Image
            className={
              theme === "business"
                ? selectedThemeButtonClassname
                : themeButtonClassname
            }
            src="/ui/briefcase.png"
            alt="Change website theme to business-like, professional"
            width={35}
            height={35}
            onClick={() => changeTheme("business")}
          />
        </div>
        <div className="flex justify-center items-center gap-3">
          <Link href="mailto:ilan147963@gmail.com">
            <Image
              className={imageClassname}
              src="/social/email.png"
              alt="Mail"
              width={35}
              height={35}
            />
          </Link>
          <Link href="https://www.instagram.com/ilan_yashuk/">
            <Image
              className={imageClassname}
              src="/social/instagram.png"
              alt="Instagram"
              width={25}
              height={25}
            />
          </Link>
          <Link href="https://www.linkedin.com/in/ilan-yashuk/">
            <Image
              className={imageClassname}
              src="/social/linkedin-hollow.png"
              alt="LinkedIn"
              width={25}
              height={25}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
