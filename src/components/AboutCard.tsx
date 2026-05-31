import Image from "next/image";
import Link from "next/link";
import type { AboutContent } from "@/lib/blog";

const socials = [
  {
    href: "https://www.instagram.com/ilan_yashuk/",
    src: "/social/instagram.png",
    alt: "Instagram",
    size: 26,
    cls: "w-5 h-5 sm:w-[26px] sm:h-[26px]",
  },
  {
    href: "https://www.linkedin.com/in/ilan-yashuk/",
    src: "/social/linkedin-hollow.png",
    alt: "LinkedIn",
    size: 26,
    cls: "w-5 h-5 sm:w-[26px] sm:h-[26px]",
  },
  {
    href: "mailto:ilan147963@gmail.com",
    src: "/social/email.png",
    alt: "Mail",
    size: 34,
    cls: "w-[26px] h-[26px] sm:w-[34px] sm:h-[34px]",
  },
];

/**
 * The top-of-home introduction: a light-teal box with a navy border. Photo on
 * the left (with the signature teal offset shadow), the rendered about.md text
 * on the right, social links underneath. Content is driven by `about.md`.
 */
const AboutCard: React.FC<{ about: AboutContent | null }> = ({ about }) => {
  if (!about) return null;

  return (
    <section className="border-2 border-[var(--secondary)] bg-[#e4f3f3] p-5 md:p-6 mb-6 sm:mb-10">
      <div className="flex flex-col sm:flex-row gap-5 md:gap-6 items-stretch">
        {about.image && (
          <img
            src={about.image}
            alt="A photo of Ilan Yashuk"
            className="hidden sm:block w-44 md:w-52 h-full object-cover image-shadow shrink-0"
          />
        )}
        <div className="flex-1 flex flex-col">
          <div
            className="prose max-w-none [&_p]:text-xs! [&_li]:text-xs! sm:[&_p]:text-base! sm:[&_li]:text-base! [&_p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: about.content }}
          />
          <div className="flex justify-end items-center gap-3 sm:gap-4 mt-1">
            {socials.map((s) => (
              <Link key={s.alt} href={s.href} aria-label={s.alt}>
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={s.size}
                  height={s.size}
                  className={`${s.cls} transition-transform duration-200 hover:scale-110`}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCard;
