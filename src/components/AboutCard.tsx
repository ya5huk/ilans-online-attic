import Image from "next/image";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import type { AboutContent } from "@/lib/blog";

const socials = [
  {
    href: "https://www.instagram.com/ilan_yashuk/",
    src: "/social/instagram.png",
    alt: "Instagram",
    w: 26,
    h: 26,
    cls: "w-5 h-5 sm:w-[26px] sm:h-[26px]",
  },
  {
    href: "https://www.linkedin.com/in/ilan-yashuk/",
    src: "/social/linkedin-hollow.png",
    alt: "LinkedIn",
    w: 26,
    h: 26,
    cls: "w-5 h-5 sm:w-[26px] sm:h-[26px]",
  },
  {
    // Envelope art is 512×359 (wide), not square — keep its true ratio and
    // match the others' height (auto width) so it isn't stretched vertically.
    href: "mailto:ilan147963@gmail.com",
    src: "/social/email.png",
    alt: "Mail",
    w: 37,
    h: 26,
    cls: "h-5 w-auto sm:h-[26px]",
  },
];

/**
 * The top-of-home introduction: a light-teal box with a teal border. Photo on
 * the left (with the signature teal offset shadow), the rendered about.md text
 * on the right, social links underneath. Content is driven by `about.md`.
 */
const AboutCard: React.FC<{ about: AboutContent | null }> = ({ about }) => {
  if (!about) return null;

  return (
    <section className="border-2 border-[var(--third)] bg-[#e4f3f3] p-5 md:p-6 mb-6 sm:mb-10">
      <div className="flex flex-col sm:flex-row gap-5 md:gap-6 items-stretch">
        {about.image && (
          <div className="relative hidden w-44 shrink-0 sm:block md:w-52">
            <SmartImage
              src={about.image}
              alt="A photo of Ilan Yashuk"
              fill
              sizes="(min-width: 768px) 208px, 176px"
              className="object-cover image-shadow"
            />
          </div>
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
                  width={s.w}
                  height={s.h}
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
