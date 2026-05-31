import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { genMetadata, MetadataGenParams } from "@/lib/metadata-related";
import FeedPage from "@/components/FeedPage";
import type { ContentMode, Lang } from "@/components/ContentExplorer";

// Content type lives in the path so each view is shareable: /writing, /images,
// /projects. Detail pages (/yap/<slug>, /pics/<slug>, /projects/<slug>) are
// more specific routes and take precedence over this single-segment match.
// Unknown single segments (e.g. /random) 404 via dynamicParams = false.
export const dynamicParams = false;

type Feed = "writing" | "images" | "projects";

const FEEDS: Record<
  Feed,
  { content: ContentMode; title: string; desc: string }
> = {
  writing: {
    content: "writing",
    title: "Writing — Ilan's Online Attic",
    desc: "Blog posts and thoughts by Ilan Yashuk.",
  },
  images: {
    content: "image",
    title: "Images — Ilan's Online Attic",
    desc: "Photos and pictures shared by Ilan Yashuk.",
  },
  projects: {
    content: "project",
    title: "Projects — Ilan's Online Attic",
    desc: "Projects built by Ilan Yashuk.",
  },
};

export function generateStaticParams() {
  return (Object.keys(FEEDS) as Feed[]).map((feed) => ({ feed }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ feed: string }>;
}): Promise<Metadata> {
  const { feed } = await params;
  const cfg = FEEDS[feed as Feed];
  if (!cfg) return {};
  return genMetadata({
    title: cfg.title,
    desc: cfg.desc,
    img: "https://ilansonlineattic.com/me/kineret-bg.png",
    imgalt: "A photo of Ilan Yashuk",
    path: `/${feed}`,
    sitetype: "website" as MetadataGenParams["sitetype"],
    inLanguage: "en-US",
  });
}

const parseLang = (v: string | string[] | undefined): Lang | undefined => {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "all" || s === "he_IL" || s === "en_US" ? s : undefined;
};

const parseTags = (v: string | string[] | undefined): string[] | undefined => {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  const tags = s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length ? tags : undefined;
};

const FeedRoute = async ({
  params,
  searchParams,
}: {
  params: Promise<{ feed: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { feed } = await params;
  const cfg = FEEDS[feed as Feed];
  if (!cfg) notFound();

  // Language & subjects are writing-only filters; ignore them elsewhere.
  const sp = await searchParams;
  const lang = cfg.content === "writing" ? parseLang(sp.lang) : undefined;
  const tags = cfg.content === "writing" ? parseTags(sp.subjects) : undefined;

  return <FeedPage content={cfg.content} lang={lang} tags={tags} />;
};

export default FeedRoute;
