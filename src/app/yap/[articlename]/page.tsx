import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{ articlename: string }>;
}

const ArticlePage: React.FC<ArticlePageProps> = async ({ params }) => {
  const { articlename } = await params;
  const post = await getPostBySlug(articlename);

  if (!post) {
    notFound();
  }

  const isHebrew = post.lang === "he_IL";

  return (
    <div
      className={`max-w-4xl mx-auto p-6 ${
        isHebrew ? "text-right" : "text-left"
      }`}
    >
      {/* Header */}
      <div className="mb-8">
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <h1
          className={`text-4xl font-bold text-gray-800 mb-4 ${
            isHebrew ? "font-rubik" : "font-eb-garamond"
          }`}
        >
          {post.title}
        </h1>

        <div className="text-gray-600 mb-6">
          <span className="font-medium">{post.date}</span>
          <span className="mx-2">•</span>
          <span>{isHebrew ? "עברית" : "English"}</span>
        </div>
      </div>

      {/* Content */}
      <article
        className={`prose prose-lg max-w-none ${
          isHebrew ? "prose-right font-rubik" : "prose-left font-eb-garamond"
        }`}
        dangerouslySetInnerHTML={{ __html: post.content }}
        style={{
          direction: isHebrew ? "rtl" : "ltr",
        }}
      />

      {/* Back to blog link */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <a
          href="/yap"
          className="inline-flex items-center text-[var(--secondary)] hover:underline font-medium"
        >
          ← {isHebrew ? "חזרה לבלוג" : "Back to blog"}
        </a>
      </div>
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
