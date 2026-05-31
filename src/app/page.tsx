import type { Metadata } from "next";
import {
  genJsonLd,
  genMetadata,
  MetadataGenParams,
} from "@/lib/metadata-related";
import FeedPage from "@/components/FeedPage";

const pageMetadata = {
  title: "Ilan's Online Attic",
  desc: "Born in 2004, my name is Ilan Yashuk. A programmer-athlete sharing writing, pictures and projects. Welcome to my online attic.",
  img: "https://ilansonlineattic.com/me/kineret-bg.png",
  imgalt: "A photo of Ilan Yashuk",
  path: "/",
  sitetype: "profile" as MetadataGenParams["sitetype"],
  inLanguage: "en-US",
};

export const metadata: Metadata = genMetadata(pageMetadata);

// `/` is the interleaved "all" feed; the profile JSON-LD lives only here.
const HomePage = () => (
  <FeedPage content="all" jsonLd={genJsonLd(pageMetadata)} />
);

export default HomePage;
