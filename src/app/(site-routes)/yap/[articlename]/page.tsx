import { getPostBySlug, getAllPosts, BlogPost } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  genJsonLd,
  genMetadata,
  MetadataGenParams,
} from "@/lib/metadata-related";
import { Metadata, ResolvingMetadata } from "next";

type ArticlePageProps = {
  params: Promise<{ articlename: string }>;
};

type MetadataProps = {
  params: Promise<{ articlename: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const getBlogPageMetadata = (articlename: string, post: BlogPost | null) => {
  const [mm, dd, yyyy] = post?.date.split(" ")[0].split("/").map(Number) || [];
  const pubDate = post?.date
    ? new Date(yyyy, mm ? mm - 1 : 0, dd ? dd : 1)
    : undefined;

  const wordCount = post?.content
    ? post.content.replace(/<[^>]*>/g, "").trim().split(/\s+/).length
    : undefined;

  const tags = post?.tags?.split(",").map((t) => t.trim()) || [];
  const lang = post?.lang === "he_IL" ? "he-IL" : "en-US";

  return {
    title: post?.title || "Blog",
    desc: post?.excerpt || "Click to read more.",
    img: post?.image || "me/kineret-bg.jpg",
    imgalt: post?.title || "The Kinneret",
    path: `/yap/${articlename}`,
    sitetype: "article" as MetadataGenParams["sitetype"],
    datepublished: pubDate,
    dateModified: pubDate,
    keywords: tags,
    inLanguage: lang,
    wordCount,
    articleSection: tags[0],
  };
};

export async function generateMetadata(
  { params, searchParams }: MetadataProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { articlename } = await params;
  const post = await getPostBySlug(articlename);
  const pageMetadata = getBlogPageMetadata(articlename, post);
  const baseMetadata = genMetadata(pageMetadata);

  const lang = post?.lang === "he_IL" ? "he-IL" : "en-US";
  const canonicalUrl = `https://www.ilansonlineattic.com/yap/${articlename}`;

  return {
    ...baseMetadata,
    alternates: {
      ...baseMetadata.alternates,
      languages: {
        [lang]: canonicalUrl,
        "x-default": canonicalUrl,
      },
    },
  };
}

const ArticlePage: React.FC<ArticlePageProps> = async ({ params }) => {
  const { articlename } = await params;
  const post = await getPostBySlug(articlename);

  const getDateStr = (date: string, isHeb: boolean) => {
    // date of string mm/dd/yyyy
    const [month, day, year] = date.split(" ")[0].split("/");
    const d = new Date(`${year}-${month}-${day}`);
    return d.toLocaleDateString(isHeb ? "he-IL" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!post) {
    notFound();
  }

  const isHebrew = post.lang === "he_IL";

  return (
    <main>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            genJsonLd(getBlogPageMetadata(articlename, post))
          ),
        }}
        type="application/ld+json"
      ></script>
      <div className="mx-auto space-y-2 " dir="auto">
        <div className="  space-y-2">
          {/* Header */}
          <h1 className={`text-4xl`}>{post.title}</h1>
          <div className="flex items-center justify-between">
            {/* Date */}
            <div>
              <span className="text-gray-400">
                {getDateStr(post.date, isHebrew)}
              </span>
            </div>
          </div>
        </div>

        {/* Image */}
        {post.image && (
          <div className="my-4">
            <img
              src={post.image}
              alt={post.title}
              className="w-full object-cover image-shadow mb-6"
            />
          </div>
        )}

        {/* Content */}
        <article
          className={`prose prose-lg max-w-none pt-2 ${isHebrew ? "prose-right" : ""}`}
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            direction: isHebrew ? "rtl" : "ltr",
          }}
        />
      </div>
    </main>
  );
};

// Generate static params for all posts
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    articlename: post.slug,
  }));
}

export default ArticlePage;
