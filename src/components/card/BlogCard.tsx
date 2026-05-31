import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/blog";
import { tagIcons } from "@/lib/tagIcons";
import { firstSentences } from "@/lib/text";

interface BlogCardProps {
  post: BlogPost;
}

/**
 * Article card. With an image it mirrors the media cards: image left + teal
 * `image-shadow`, fixed height, text column on the right. The excerpt is capped
 * by *sentence* (deterministic regardless of the column width) — one sentence on
 * mobile, three on desktop — via two paragraphs swapped purely by breakpoint, so
 * the card needs no client-side JS.
 */
const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const [mm, dd, yyyy] = post.date.split(" ")[0].split("/");
  const hasImage = !!post.image;
  const oneSentence = firstSentences(post.excerpt, 1);
  const threeSentences = firstSentences(post.excerpt, 3);

  const meta = (
    <div className="flex items-center gap-1">
      <p className="text-xs md:text-sm font-medium text-gray-500 transition-colors md:group-hover:text-white font-ui">
        {`${yyyy}-${mm}-${dd}`}
      </p>
      <div className="flex">
        {post.tags &&
          post.tags
            .split(",")
            .map(
              (tag) =>
                tagIcons[tag.trim() as keyof typeof tagIcons] && (
                  <Image
                    key={post.title + tag}
                    src={tagIcons[tag.trim() as keyof typeof tagIcons] || ""}
                    alt={`${tag} icon`}
                    width={18}
                    height={18}
                    className="group-hover:invert transition-all duration-200"
                  />
                )
            )}
      </div>
    </div>
  );

  const title = (
    <h2 className="text-lg md:text-2xl leading-tight mt-0.5">{post.title}</h2>
  );

  // One sentence on mobile, three on desktop — toggled by breakpoint only.
  const description = (
    <>
      <p className="md:hidden mt-1 text-xs leading-relaxed">{oneSentence}</p>
      <p className="hidden md:block mt-1 text-sm leading-relaxed">
        {threeSentences}
      </p>
    </>
  );

  return (
    <Link href={`/yap/${post.slug}`}>
      <div
        className="group py-2 md:px-2 md:py-4 md:rounded cursor-pointer transition-colors duration-200 md:hover:bg-[var(--secondary)] md:hover:text-white"
        dir="auto"
      >
        {hasImage ? (
          <div className="flex flex-row gap-4 md:gap-5 h-56 md:h-72">
            <div className="w-1/2 shrink-0 h-full">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                className="w-full h-full object-cover image-shadow"
              />
            </div>
            <div className="w-1/2 h-full flex flex-col overflow-hidden">
              {meta}
              {title}
              {description}
            </div>
          </div>
        ) : (
          <div>
            {meta}
            {title}
            {description}
          </div>
        )}
      </div>
    </Link>
  );
};

export default BlogCard;
