import Link from "next/link";
import { BlogPost } from "@/lib/blog";
import { tagIcons } from "@/lib/tagIcons";
import Image from "next/image";

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const [mm, dd, yyyy] = post.date.split(" ")[0].split("/");

  return (
    <Link href={`/yap/${post.slug}`}>
      <div
        className="group md:px-2 md:py-4 py-2 md:rounded cursor-pointer md:hover:bg-[var(--secondary)] md:hover:text-white transition-colors duration-200"
        dir="auto"
      >
        <div className="flex flex-col sm:flex-row md:gap-4">
          <div className="flex-2">
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium">{`${yyyy}-${mm}-${dd}`}</p>
                <div className="flex">
                  {post.tags &&
                    post.tags
                      .split(",")
                      .map(
                        (tag) =>
                          tagIcons[tag.trim() as keyof typeof tagIcons] && (
                            <Image
                              key={post.title + tag}
                              src={
                                tagIcons[tag.trim() as keyof typeof tagIcons] ||
                                ""
                              }
                              alt={`${tag} icon`}
                              width={20}
                              height={20}
                              className="group-hover:invert transition-all duration-200"
                            />
                          )
                      )}
                </div>
              </div>
              <h2 className={`text-xl font-bold`}>{post.title}</h2>
              <p className={`mt-1 leading-relaxed`}>{post.excerpt}</p>
            </div>
          </div>

          {post.image && (
            <div className="hidden md:block flex-1">
              <img src={post.image} alt={post.title} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
