"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Footer: React.FC = () => {
  const [theme, setTheme] = useState("leaves");

  // on hover -> Make image larger

  const imageClassname =
    "transition-transform duration-200 hover:scale-110 invert";

  const themeButtonClassname =
    "transition-transform duration-200 invert scale-60";
  const selectedThemeButtonClassname = themeButtonClassname + " scale-110";

  const changeTheme = (themename: string) => {
    setTheme(themename);
    document.documentElement.setAttribute("data-theme", themename);
  };

  return (
    <div className="w-full bg-[var(--secondary)] p-8">
      <div className="px-4 max-w-3xl mx-auto flex justify-between  items-center">
        <div className="flex justify-center items-center ">
          {" "}
          <Image
            className={
              theme === "leaves"
                ? selectedThemeButtonClassname
                : themeButtonClassname
            }
            src="/ui/leaves.png"
            alt="Change website theme to forest."
            width={50}
            height={50}
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
            width={40}
            height={40}
            onClick={() => changeTheme("business")}
          />
        </div>
        <div className="flex justify-center items-center gap-4">
          <Link href="mailto:ilan147963@gmail.com">
            <Image
              className={imageClassname}
              src="/social/email.png"
              alt="Mail"
              width={40}
              height={40}
            />
          </Link>
          <Link href="https://www.instagram.com/ilan_yashuk/">
            <Image
              className={imageClassname}
              src="/social/instagram.png"
              alt="Instagram"
              width={30}
              height={30}
            />
          </Link>
          <Link href="https://www.linkedin.com/in/ilan-yashuk/">
            <Image
              className={imageClassname}
              src="/social/linkedin-hollow.png"
              alt="LinkedIn"
              width={30}
              height={30}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
