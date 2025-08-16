import { getPostBySlug, getAllPosts } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{ articlename: string }>;
}

const ArticlePage: React.FC<ArticlePageProps> = async ({ params }) => {
  const { articlename } = await params;
  const post = await getPostBySlug(articlename);

  const getDateStr = (date: string, isHeb: boolean) => {
    // date of string mm/dd/yyyy
    const [month, day, year] = date.split("/");
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
    <div className="mx-auto space-y-4" dir="auto">
      {/* Header */}
      <h1
        className={`text-4xl font-bold ${isHebrew ? "" : "font-eb-garamond"}`}
      >
        {post.title}
      </h1>

      <div className="flex items-center justify-between">
        {/* Date */}
        <div>
          <span className="text-lg font-medium">
            {getDateStr(post.date, isHebrew)}
          </span>
        </div>
        <Link className="link-button" href="/yap">
          {isHebrew ? "חזרה" : "Back"}
        </Link>
      </div>

      {/* Image */}
      <div className="mb-8">
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full object-cover image-shadow mb-6"
          />
        )}
      </div>

      {/* Content */}
      <article
        className={`prose prose-lg max-w-none`}
        dangerouslySetInnerHTML={{ __html: post.content }}
        style={{
          direction: isHebrew ? "rtl" : "ltr",
        }}
      />
    </div>
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
