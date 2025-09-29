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
  desc: "Born in 2004, my name is Ilan Yashuk. I love to create. More on me in this page.",
  img: "https://ilansonlineattic.com/me/kineret-bg.png",
  imgalt: "A photo of me",
  path: "/about",
  sitetype: "profile" as MetadataGenParams["sitetype"],
};

export const metadata: Metadata = genMetadata(pageMetadata);

const AboutPage: React.FC = () => {
  const currDate = new Date();
  const birthDate = new Date(2004, 8, 14);
  const diffTime = currDate.getTime() - birthDate.getTime();
  const myAge = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));

  const linkClassname = "font-bold text-[var(--secondary)]";

  return (
    <main>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(genJsonLd(pageMetadata)),
        }}
        type="application/ld+json"
      ></script>

      <div className="mx-auto max-w-3xl p-4 md:px-0 mb-12 space-y-3">
        <HeaderText>A·bout</HeaderText>
        <div className="grid grid-cols-[45px_auto] text-lg items-center space-y-2">
          <svg
            className="mb-auto"
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#000000"
          >
            <path d="M580-450h180v-60H580v60Zm0-120h180v-60H580v60ZM200-320h320v-19q0-42-42.5-68.5T360-434q-75 0-117.5 26.5T200-339v19Zm159.92-174q30.08 0 51.58-21.42t21.5-51.5q0-30.08-21.42-51.58t-51.5-21.5q-30.08 0-51.58 21.42t-21.5 51.5q0 30.08 21.42 51.58t51.5 21.5ZM140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H140Zm0-60h680v-520H140v520Zm0 0v-520 520Z" />
          </svg>
          <p> Ilan Yashuk, 2004 ({myAge}) | Hebrew, English, Russian.</p>
          <svg
            className="mb-auto"
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#000000"
          >
            <path d="M480.06-486.67q30.27 0 51.77-21.56 21.5-21.55 21.5-51.83 0-30.27-21.56-51.77-21.55-21.5-51.83-21.5-30.27 0-51.77 21.56-21.5 21.55-21.5 51.83 0 30.27 21.56 51.77 21.55 21.5 51.83 21.5ZM480-168q129.33-118 191.33-214.17 62-96.16 62-169.83 0-114.86-73.36-188.1-73.36-73.23-179.97-73.23T300.03-740.1q-73.36 73.24-73.36 188.1 0 73.67 63 169.83Q352.67-286 480-168Zm0 88Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" />
          </svg>
          <p>Born in Southern 🇮🇱 </p>
          <svg
            className="mb-auto"
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#000000"
          >
            <path d="M146.67-120q-27 0-46.84-19.83Q80-159.67 80-186.67v-466.66q0-27 19.83-46.84Q119.67-720 146.67-720H320v-93.33q0-27 19.83-46.84Q359.67-880 386.67-880h186.66q27 0 46.84 19.83Q640-840.33 640-813.33V-720h173.33q27 0 46.84 19.83Q880-680.33 880-653.33v466.66q0 27-19.83 46.84Q840.33-120 813.33-120H146.67Zm0-66.67h666.66v-466.66H146.67v466.66Zm240-533.33h186.66v-93.33H386.67V-720Zm-240 533.33v-466.66 466.66Z" />
          </svg>
          <p>
            Connecting & Creating via code, lens, bare hands... whatever as long
            as its something new to the world. See{" "}
            <Link href="/projects" className={linkClassname}>
              projects
            </Link>
            .<br />
          </p>
          <svg
            className="mb-auto"
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#000000"
          >
            <path d="M80-600v-120q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v120h-80v-120H160v120H80Zm80 440q-33 0-56.5-23.5T80-240v-120h80v120h640v-120h80v120q0 33-23.5 56.5T800-160H160Zm240-120q11 0 21-5.5t15-16.5l124-248 44 88q5 11 15 16.5t21 5.5h240v-80H665l-69-138q-5-11-15-15.5t-21-4.5q-11 0-21 4.5T524-658L400-410l-44-88q-5-11-15-16.5t-21-5.5H80v80h215l69 138q5 11 15 16.5t21 5.5Zm80-200Z" />
          </svg>
          <p>
            Sports gets a 🦁 share out of my personality. Hiking, travelling,
            exploring - I like those too. See{" "}
            <Link className={linkClassname} href="/pics">
              Pictures
            </Link>
            .
          </p>
          <svg
            className="mb-auto"
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#000000"
          >
            <path d="M530-40v-239.33L430-372l-41.33 184L120-243.33l12.67-64 196.66 40 70-354-90.66 40.66V-446H242v-179.33L404-694q33-14.33 47.5-18.17Q466-716 480-716q20.33 0 36.67 9.33Q533-697.33 544-680l41.33 66q26 42 70.84 71.67Q701-512.67 760-512.67V-446q-66.67 0-120.83-29.83Q585-505.67 542-562l-34 145.33L596.67-334v294H530Zm10-709.33q-31 0-53.17-22.17-22.16-22.17-22.16-53.17t22.16-53.16Q509-900 540-900t53.17 22.17q22.16 22.16 22.16 53.16 0 31-22.16 53.17Q571-749.33 540-749.33Z" />
          </svg>
          <div>
            <p>
              Currently in my 7th (8 total, 1 absent) year training & competing
              in Track & Field . <br />
              My PB&apos;s are:
              <br /> 100m -&gt; 11.21s
              <br />
              LJ -&gt; 6.75m (6.80w)
            </p>
          </div>
          <svg
            className="mb-auto"
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#000000"
          >
            <path d="M354.67-120h-168q-27 0-46.84-19.83Q120-159.67 120-186.67v-168q45.33-3.33 78.33-33.16 33-29.84 33-74.17t-33-74.17q-33-29.83-78.33-33.16v-168q0-27 19.83-46.84Q159.67-804 186.67-804H358q7.33-40.67 36-68.33Q422.67-900 463.33-900q40.67 0 69.34 27.67 28.66 27.66 36 68.33h168.66q27 0 46.84 19.83Q804-764.33 804-737.33v168.66q40.67 7.34 67.33 37.34 26.67 30 26.67 70.66 0 40.67-26.67 68.34-26.66 27.66-67.33 35v170.66q0 27-19.83 46.84Q764.33-120 737.33-120h-168q-3.33-48.67-34.16-80-30.84-31.33-73.17-31.33T388.83-200q-30.83 31.33-34.16 80Zm-168-66.67h115q24.66-62.66 72.26-87 47.59-24.33 88-24.33 40.4 0 88.07 24.33 47.67 24.34 72.33 87h115v-236.66H794q16 0 26.67-10.67 10.66-10.67 10.66-26.67t-10.66-26.66Q810-498 794-498h-56.67v-239.33H500.67V-796q0-16-10.67-26.67-10.67-10.66-26.67-10.66t-26.66 10.66Q426-812 426-796v58.67H186.67v116q50.1 18.54 80.71 62.12Q298-515.63 298-461.85q0 52.85-30.67 96.52-30.66 43.66-80.66 62.66v116Zm276.66-274Z" />
          </svg>
          <p>
            <Link
              className={linkClassname}
              href="https://www.instagram.com/ilan_yashuk/"
              aria-label="Instagram"
            >
              Gram
            </Link>{" "}
            |{" "}
            <Link
              className={linkClassname}
              href="https://www.linkedin.com/in/ilan-yashuk/"
              aria-label="Linkedin"
            >
              LinkedIn
            </Link>{" "}
            |{" "}
            <Link
              className={linkClassname}
              href="mailto:ilan147963@gmail.com"
              aria-label="Send me a mail"
            >
              Mail me
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
