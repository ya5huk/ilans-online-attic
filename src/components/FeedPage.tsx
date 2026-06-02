import {
  getAboutContent,
  getAllPosts,
  getAllImages,
  getAllProjects,
  byDateDesc,
  ContentItem,
} from "@/lib/blog";
import AboutCard from "@/components/AboutCard";
import ContentExplorer, {
  type ContentMode,
  type Lang,
} from "@/components/ContentExplorer";

// The feed only needs metadata + excerpt client-side, never the rendered HTML
// body — drop it to keep the client payload small.
const lite = (items: ContentItem[]): ContentItem[] =>
  items.map((it) => ({ ...it, content: "" }));

interface FeedPageProps {
  // Which feed to show (route-driven): all / writing / image / project.
  content: ContentMode;
  // Writing-only filters, seeded from the URL query on first render.
  lang?: Lang;
  tags?: string[];
  // When provided (home only), emit the page's JSON-LD structured data.
  jsonLd?: object;
}

/**
 * Shared layout for every feed view (`/`, `/writing`, `/images`, `/projects`).
 * Server component: fetches all content once, then hands it to the client-side
 * <ContentExplorer> with the route's content type + initial filters.
 */
const FeedPage = async ({ content, lang, tags, jsonLd }: FeedPageProps) => {
  const [about, posts, images, projects] = await Promise.all([
    getAboutContent(),
    getAllPosts(),
    getAllImages(),
    getAllProjects(),
  ]);

  const all = [...posts, ...images, ...projects].sort(byDateDesc);

  return (
    <main>
      {jsonLd && (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
      )}
      <div className="mx-auto max-w-4xl p-4 md:px-0 mb-12">
        <AboutCard about={about} />
        <ContentExplorer
          initialContent={content}
          initialLang={lang}
          initialTags={tags}
          posts={lite(posts)}
          images={lite(images)}
          projects={lite(projects)}
          all={lite(all)}
        />
      </div>
    </main>
  );
};

export default FeedPage;
