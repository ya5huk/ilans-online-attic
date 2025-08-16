"use client";

import { useState, useEffect } from "react";
import BlogCard from "@/components/card/BlogCard";
import { BlogPost } from "@/lib/blog";

interface BlogListProps {
  posts: BlogPost[];
}

const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  const stringToDate = (datestr: string) => {
    // Convert mm/dd/yyyy to Date
    const [month, day, year] = datestr.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  // Fill posts by year
  const yearPosts: { [key: string]: BlogPost[] } = {};
  posts.forEach((post) => {
    const year = post.date.split("/")[2];
    if (!yearPosts[year]) {
      yearPosts[year] = [];
    }
    yearPosts[year].push(post);
  });
  const sortedYears = Object.keys(yearPosts).sort(Number).reverse();

  return (
    <>
      {/* Blog Posts */}
      <div>
        {sortedYears.map((year) => (
          <div key={year}>
            <div className="flex items-center gap-4 w-full">
              <span className="flex-grow h-1 bg-[var(--third)]"></span>
              <h3 className="text-3xl font-semibold font-dm-serif">{year}</h3>
              <span className="flex-grow h-1 bg-[var(--third)]"></span>
            </div>
            {yearPosts[year]
              .sort((a, b) =>
                stringToDate(a.date) < stringToDate(b.date) ? 1 : -1
              )
              .map((post, idx) => (
                <div key={post.slug}>
                  <BlogCard key={post.slug} post={post} />
                  {idx !== yearPosts[year].length - 1 && (
                    <span className="block h-0.5 bg-[var(--third)]"></span>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default BlogList;
