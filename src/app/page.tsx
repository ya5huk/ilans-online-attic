import HeaderText from "@/components/text/HeaderText";
import SubheaderText from "@/components/text/SubheaderText";
import Link from "next/link";
import type { Metadata } from "next";
import {
  genJsonLd,
  genMetadata,
  MetadataGenParams,
} from "@/lib/metadata-related";
import Image from "next/image";

const pageMetadata = {
  title: "About",
  desc: "Born in 2004, my name is Ilan Yashuk. I love to create stuff (and train). More on me in this page.",
  img: "https://ilansonlineattic.com/me/kineret-bg.png",
  imgalt: "A photo of me",
  path: "/about",
  sitetype: "profile" as MetadataGenParams["sitetype"],
  inLanguage: "en-US",
};

export const metadata: Metadata = genMetadata(pageMetadata);

const AboutPage: React.FC = () => {
  const currDate = new Date();
  const birthDate = new Date(2004, 8, 14);
  const diffTime = currDate.getTime() - birthDate.getTime();
  const myAge = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));

  const linkClassname = "font-bold text-[var(--third)]";

  return (
    <main>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(genJsonLd(pageMetadata)),
        }}
        type="application/ld+json"
      ></script>

      <div className="mx-auto max-w-2xl p-4 md:px-0 mb-12">
        <HeaderText>A·bout</HeaderText>
        <div className="mt-2 space-y-2">
          <p>
            Hey 👋 My name&apos;s Ilan! I&apos;m a {myAge} years old
            programmer-athlete from 🇮🇱.
          </p>
          <p>
            <strong>My programmer part:</strong>
          </p>
          <ul>
            <li>
              I created multiple production-ready websites that are used daily
            </li>
            <li>
              Front: Nextjs (React), React Native, Nuxt (Vue), Tailwind CSS (&
              ofc html, js, css)
            </li>
            <li>Back: Python, Flask</li>
            <li>
              DB: Rational (i.e. Supabase=PostgreSQL), Non-rational (i.e. Google
              Firebase)
            </li>
            <li>
              Workflow: git, Copilot Agent, Automated PRs, Claude Code, Google
              AI studio...{" "}
            </li>
          </ul>
          <p>
            <strong>My athlete part:</strong>
          </p>
          <ul>
            <li>
              I am a competitive track & field athlete active from 2018 (2025
              didn&apos;t compete) &apos;til now
            </li>
            <li>
              My PBs are: 100m - 11.21s, Long Jump - 6.75m (6.80w) (both from
              2023)
            </li>
          </ul>
          <p>
            <strong>My other parts:</strong>
          </p>
          <ul>
            <li>
              I love reading, hiking, travelling, even weird art sometimes
            </li>
            <li>
              I LOVE conversations, people. Imo closemindness slows growth.
            </li>
            <li>I speak, read &apos;n write in 🇮🇱, 🇬🇧 and 🇷🇺.</li>
            <li>Not a foodie but love eating. What a goated activity.</li>
            <li>
              I tend to get too philosophical and complicate stuff sometimes. If
              this was a job interview, I would say this is just me having a
              broad view on life (and myself).
            </li>
            <li>I love history, cool maps, geography in general.</li>
          </ul>
          <p>
            <strong>A final welcome:</strong>
          </p>
          <p>
            Welcome to my <strong>online attic</strong>, a place where I store
            my <s>unimaginably useless</s> helpful thoughts! I am strong
            believer that not every tackle in yo&apos; life deserves a
            10-A4-page post, plus you ain&apos;t no main character. But... I do
            learn lessons once in a while that, I think, are worth sharing. You
            won&apos;t see AI slop here. I really try to give value in my posts
            and just - show the journey, because I know how much I needed that
            while coming up. And it&apos;s not that I am up, hell no, but I will
            be. And it is all documented here.
          </p>
        </div>

        <p className="mt-2">
          My other links:{" "}
          <Link
            className={linkClassname}
            href="https://www.instagram.com/ilan_yashuk/"
            aria-label="Instagram"
          >
            Instagram
          </Link>
          ,{" "}
          <Link
            className={linkClassname}
            href="https://www.linkedin.com/in/ilan-yashuk/"
            aria-label="Linkedin"
          >
            LinkedIn
          </Link>
          ,{" "}
          <Link
            className={linkClassname}
            href="mailto:ilan147963@gmail.com"
            aria-label="Send me a mail"
          >
            Mail
          </Link>
        </p>
      </div>
    </main>
  );
};

export default AboutPage;
