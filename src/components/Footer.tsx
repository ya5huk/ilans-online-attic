"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Footer: React.FC = () => {
  // const [theme, setTheme] = useState("leaves");

  // on hover -> Make image larger

  const imageClassname =
    "transition-transform duration-250 hover:scale-110 invert";

  return (
    <div className="w-full bg-[var(--secondary)] p-4 md:p-8">
      <div className="md:px-4 max-w-3xl mx-auto flex justify-center items-center gap-3">
        <Link href="https://www.instagram.com/ilan_yashuk/">
          <Image
            className={imageClassname}
            src="/social/instagram.png"
            alt="Instagram"
            width={25}
            height={25}
          />
        </Link>
        <Link href="mailto:ilan147963@gmail.com">
          <Image
            className={imageClassname}
            src="/social/email.png"
            alt="Mail"
            width={34}
            height={34}
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
  );
};

export default Footer;
