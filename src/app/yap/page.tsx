import HeaderText from "@/components/text/HeaderText";
import BlogCard from "@/components/card/BlogCard";
import { getAllPosts } from "@/lib/blog";
import BlogList from "@/components/BlogList";
import Image from "next/image";

const YapPage: React.FC = async () => {
  const posts = await getAllPosts();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <HeaderText centertext disableunderline>
        Web·log
      </HeaderText>
      <BlogList posts={posts} />
    </div>
  );
};

export default YapPage;
