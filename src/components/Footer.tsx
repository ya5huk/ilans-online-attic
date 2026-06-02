import Image from "next/image";
import Link from "next/link";

const Footer: React.FC = () => {
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
        {/* Envelope art is 512×359 (wide); match the others' height with a
            true-ratio box so it isn't stretched into a square. */}
        <Link href="mailto:ilan147963@gmail.com">
          <Image
            className={`${imageClassname} h-[25px] w-auto`}
            src="/social/email.png"
            alt="Mail"
            width={37}
            height={26}
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
