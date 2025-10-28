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
          <div className="flex-2">
            <div>
              <p className="text-sm font-medium ">{`${yyyy}-${mm}-${dd}`}</p>
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
