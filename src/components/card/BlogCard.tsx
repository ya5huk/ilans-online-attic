import Link from "next/link";
import { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <Link href={`/yap/${post.slug}`}>
      <div
        className="md:px-2 md:py-4 py-2 md:rounded cursor-pointer md:hover:bg-[var(--third)] md:hover:text-white"
        dir="auto"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <h2 className={`text-2xl font-bold`}>{post.title}</h2>

            <p className={`leading-relaxed`}>{post.excerpt}</p>
            <div className="text-sm font-medium">{post.date}</div>
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
