import Link from "next/link";
import { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const [mm, dd, yyyy] = post.date.split("/");

  return (
    <Link href={`/yap/${post.slug}`}>
      <div
        className="md:px-2 md:py-4 py-2 md:rounded cursor-pointer md:hover:bg-[var(--secondary)] md:hover:text-white transition-colors duration-200"
        dir="auto"
      >
        <div className="flex flex-col sm:flex-row md:gap-4">
          <div className="flex-1">
            <div className="h-full flex flex-col justify-between">
              <div>
                <h2 className={`text-xl font-bold`}>{post.title}</h2>
                <p className={`mt-1 leading-relaxed`}>{post.excerpt}</p>
              </div>

              <p className="text-sm font-medium text-end">{`${yyyy}-${mm}-${dd}`}</p>
            </div>
          </div>

          {post.image && (
            <div className="w-0 md:w-36">
              <img src={post.image} alt={post.title} className="rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
