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

  const linkClassname = "text-[var(--secondary)] font-bold underline";

  const summaryImgClass = "w-7 h-7";

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

        <div className="space-y-2 text-lg">
          <p> Je m'appelle Ilan Yashuk.</p>
          <p>
            I have 0 link with French and a lot more with south of Israel, where
            I was born in 2004 (I'm {myAge}). I speak, read 'n write in Hebrew,
            English & Russian.
          </p>
          <p>
            I love documenting, capturing, creating... through lens or via power
            of code - I love bringing something new to the world. <br />
          </p>
          <p>
            Other than that, Sports gets a lion share out of my personality.
            Hiking, travelling, exploring - I like those too.
          </p>
          <p>
            I currently on my 7th year training & competing in Track & Field, my
            PB's are:{" "}
          </p>
          <p>
            100m -&gt; 11.21s
            <br />
            LJ -&gt; 6.75m (6.80w)
          </p>
        </div>
        <div></div>
      </div>
    </main>
  );
};

export default AboutPage;
