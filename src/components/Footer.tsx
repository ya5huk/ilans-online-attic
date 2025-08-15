import Image from "next/image";
import SubheaderText from "./text/SubheaderText";
import Link from "next/link";

const Footer: React.FC = () => {
  // on hover -> Make image larger
  const imageClassname = "transition-transform duration-200 hover:scale-110";

  return (
    <div className="w-full bg-[var(--secondary)] p-8">
      <div className="max-w-3xl mx-auto flex justify-center items-center gap-4">
        <Link href="mailto:ilan147963@gmail.com">
          <Image
            className={imageClassname}
            src="/social/email.png"
            alt="Mail"
            width={45}
            height={45}
          />
        </Link>
        <Link href="https://www.instagram.com/ilan_yashuk/">
          <Image
            className={imageClassname}
            src="/social/instagram.png"
            alt="Instagram"
            width={35}
            height={35}
          />
        </Link>
        <Link href="https://www.linkedin.com/in/ilan-yashuk/">
          <Image
            className={imageClassname}
            src="/social/linkedin-hollow.png"
            alt="LinkedIn"
            width={35}
            height={35}
          />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
