"use client";

import { useState, useEffect } from "react";
import BlogCard from "@/components/card/BlogCard";
import { BlogPost } from "@/lib/blog";

interface BlogListProps {
  posts: BlogPost[];
}

const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  const languages = [
    "all",
    ...Array.from(new Set(posts.map((post) => post.lang))),
  ];

  const stringToDate = (datestr: string) => {
    // Convert mm/dd/yyyy to Date
    const [month, day, year] = datestr.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  return (
    <>
      {/* Blog Posts */}
      <div className="space-y-6">
        {posts
          .sort((a, b) =>
            stringToDate(a.date) < stringToDate(b.date) ? 1 : -1
          )
          .map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
      </div>
    </>
  );
};

export default BlogList;
