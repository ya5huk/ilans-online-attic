"use client";

import { useState, useEffect } from "react";
import BlogCard from "@/components/card/BlogCard";
import { BlogPost } from "@/lib/blog";
import { tagIcons } from "@/lib/tagIcons";
import Image from "next/image";
import { DM_Serif_Display } from "next/font/google";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
});
interface BlogListProps {
  posts: BlogPost[];
}

const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  const [selectedLang, setSelectedLang] = useState<"all" | "he_IL" | "en_US">(
    "en_US",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<BlogPost[]>(posts);

  useEffect(() => {
    let filtered = posts;

    // Filter by language
    if (selectedLang !== "all") {
      filtered = filtered.filter((post) => post.lang === selectedLang);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.some(
          (tag) =>
            post.tags &&
            post.tags
              .split(",")
              .map((t) => t.trim())
              .includes(tag),
        ),
      );
    }

    setSelectedPosts(filtered);
  }, [selectedLang, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const stringToDate = (datestr: string) => {
    // Convert mm/dd/yyyy or mm/dd/yyyy HH:mm to Date
    const [datePart, timePart] = datestr.split(" ");
    const [month, day, year] = datePart.split("/");
    if (timePart) {
      return new Date(`${year}-${month}-${day}T${timePart}`);
    }
    return new Date(`${year}-${month}-${day}`);
  };

  // Fill posts by year
  const yearPosts: { [key: string]: BlogPost[] } = {};
  selectedPosts.forEach((post) => {
    const year = post.date.split(" ")[0].split("/")[2];
    if (!yearPosts[year]) {
      yearPosts[year] = [];
    }
    yearPosts[year].push(post);
  });
  const sortedYears = Object.keys(yearPosts).sort(Number).reverse();

  return (
    <>
      {/* Filters */}
      <div className="flex justify-center items-center gap-3 mt-4 mb-4">
        {/* Tag filters */}
        {Object.keys(tagIcons).map((tag) => {
          const isActive = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              className="flex flex-col items-center gap-1 transition-all duration-200 hover:cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              <Image
                src={tagIcons[tag as keyof typeof tagIcons]}
                alt={tag}
                width={28}
                height={28}
                className="transition-all duration-200 hover:opacity-80"
                style={{
                  filter: isActive ? "none" : "grayscale(1) opacity(0.3)",
                }}
              />
              <span
                className={`block h-0.5 w-4 rounded-full transition-all duration-200 ${
                  isActive ? "bg-[var(--third)]" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}

        {/* Divider */}
        <span className="self-center h-6 w-px bg-gray-300" />

        {/* Language filters */}
        {(
          [
            { key: "all", label: "All", img: null },
            { key: "he_IL", label: "Hebrew", img: "/ui/israel-flag.png" },
            { key: "en_US", label: "English", img: "/ui/uk-flag.png" },
          ] as const
        ).map(({ key, label, img }) => {
          const isActive = selectedLang === key;
          return (
            <button
              key={key}
              type="button"
              className="flex flex-col items-center gap-1 transition-all duration-200 hover:cursor-pointer"
              onClick={() => setSelectedLang(key)}
            >
              {img ? (
                <Image
                  src={img}
                  alt={label}
                  width={32}
                  height={32}
                  className="transition-all duration-200 hover:opacity-80"
                  style={{
                    filter: isActive ? "none" : "grayscale(1) opacity(0.3)",
                  }}
                />
              ) : (
                <span
                  className={`text-sm font-medium transition-all duration-200 ${
                    isActive ? "text-[var(--secondary)]" : "text-gray-300"
                  }`}
                >
                  All
                </span>
              )}
              <span
                className={`block h-0.5 w-4 rounded-full transition-all duration-200 ${
                  isActive ? "bg-[var(--third)]" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
      {/* Blog Posts */}
      <div>
        {sortedYears.map((year) => (
          <div key={year}>
            <div className="flex items-center gap-4 w-full">
              <span className="flex-grow h-1 bg-[var(--secondary)]"></span>
              <h3
                className={`${dmSerif.className} text-3xl font-bold tracking-widest`}
              >
                {year}
              </h3>
              <span className="flex-grow h-1 bg-[var(--secondary)]"></span>
            </div>
            {yearPosts[year]
              .sort((a, b) =>
                stringToDate(a.date) < stringToDate(b.date) ? 1 : -1,
              )
              .map((post, idx) => (
                <div key={post.slug}>
                  <BlogCard key={post.slug} post={post} />
                  {idx !== yearPosts[year].length - 1 && (
                    <span className="block h-0.5 bg-[var(--secondary)]"></span>
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
