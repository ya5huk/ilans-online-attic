import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getImageBySlug, getAllImages, ContentItem } from "@/lib/blog";
import {
  genJsonLd,
  genMetadata,
  MetadataGenParams,
} from "@/lib/metadata-related";
import DetailView from "@/components/DetailView";

type Props = { params: Promise<{ slug: string }> };

const getImageMetadata = (slug: string, item: ContentItem | null) => {
  const [mm, dd, yyyy] = item?.date.split(" ")[0].split("/").map(Number) || [];
  const pubDate = item?.date
    ? new Date(yyyy, mm ? mm - 1 : 0, dd ? dd : 1)
    : undefined;

  return {
    title: item?.title || "Picture",
    desc: item?.excerpt || "A moment from my life, through a camera.",
    img: item?.image || "/me/kineret-bg.jpg",
    imgalt: item?.title || "Picture",
    path: `/pics/${slug}`,
    sitetype: "article" as MetadataGenParams["sitetype"],
    datepublished: pubDate,
    dateModified: pubDate,
    inLanguage: "en-US",
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getImageBySlug(slug);
  return genMetadata(getImageMetadata(slug, item));
}

export async function generateStaticParams() {
  const images = await getAllImages();
  return images.map((i) => ({ slug: i.slug }));
}

const ImageDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  const item = await getImageBySlug(slug);
  if (!item) notFound();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(genJsonLd(getImageMetadata(slug, item))),
        }}
        type="application/ld+json"
      />
      <DetailView item={item} />
    </>
  );
};

export default ImageDetailPage;
