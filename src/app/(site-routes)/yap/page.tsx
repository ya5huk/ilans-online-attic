import HeaderText from "@/components/text/HeaderText";
import { getAllPosts } from "@/lib/blog";
import BlogList from "@/components/BlogList";
import {
  genJsonLd,
  genMetadata,
  MetadataGenParams,
} from "@/lib/metadata-related";
import { Metadata } from "next";

const pageMetadata = {
  title: "Blog (Yapping)",
  desc: "I am... thoughtful some say. Bad or good, you decide. Either way, you are more than welcome to read what I've wrote. Books, Sports, Philosophy, Tech, Programming, English, Hebrew. Enjoy!",
  img: "https://ilansonlineattic.com/me/kineret-bg.jpg",
  imgalt: "The Kinneret",
  path: "/yap",
  sitetype: "website" as MetadataGenParams["sitetype"],
};

export const metadata: Metadata = genMetadata(pageMetadata);

const YapPage: React.FC = async () => {
  const posts = await getAllPosts();

  return (
    <main>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(genJsonLd(pageMetadata)),
        }}
        type="application/ld+json"
      ></script>
      <div className="max-w-4xl mx-auto ">
        <HeaderText centertext disableunderline>
          Web·log
        </HeaderText>
        <BlogList posts={posts} />
      </div>
    </main>
  );
};

export default YapPage;
