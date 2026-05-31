import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProjectBySlug, getAllProjects, ContentItem } from "@/lib/blog";
import {
  genJsonLd,
  genMetadata,
  MetadataGenParams,
} from "@/lib/metadata-related";
import DetailView from "@/components/DetailView";

type Props = { params: Promise<{ slug: string }> };

const getProjectMetadata = (slug: string, item: ContentItem | null) => {
  const [mm, dd, yyyy] = item?.date.split(" ")[0].split("/").map(Number) || [];
  const pubDate = item?.date
    ? new Date(yyyy, mm ? mm - 1 : 0, dd ? dd : 1)
    : undefined;

  return {
    title: item?.title || "Project",
    desc: item?.excerpt || "A project I built.",
    img: item?.image || "/projects/visuathlete-showcase.png",
    imgalt: item?.title || "Project",
    path: `/projects/${slug}`,
    sitetype: "article" as MetadataGenParams["sitetype"],
    datepublished: pubDate,
    dateModified: pubDate,
    inLanguage: "en-US",
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getProjectBySlug(slug);
  return genMetadata(getProjectMetadata(slug, item));
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

const ProjectDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  const item = await getProjectBySlug(slug);
  if (!item) notFound();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(genJsonLd(getProjectMetadata(slug, item))),
        }}
        type="application/ld+json"
      />
      <DetailView item={item} />
    </>
  );
};

export default ProjectDetailPage;
