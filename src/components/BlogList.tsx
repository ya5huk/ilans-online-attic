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
    "en_US"
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
              .includes(tag)
        )
      );
    }

    setSelectedPosts(filtered);
  }, [selectedLang, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const stringToDate = (datestr: string) => {
    // Convert mm/dd/yyyy to Date
    const [month, day, year] = datestr.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  // Fill posts by year
  const yearPosts: { [key: string]: BlogPost[] } = {};
  selectedPosts.forEach((post) => {
    const year = post.date.split("/")[2];
    if (!yearPosts[year]) {
      yearPosts[year] = [];
    }
    yearPosts[year].push(post);
  });
  const sortedYears = Object.keys(yearPosts).sort(Number).reverse();

  const selectionButtonClass =
    "hover:cursor-pointer transition-colors duration-300 ";
  const innerButtonClass = "p-1 transition-colors duration-300";

  return (
    <>
      {/* Blog tag selection */}
      <div className="flex justify-center items-center gap-2 mb-2">
        {Object.keys(tagIcons).map((tag) => (
          <button
            key={tag}
            type="button"
            className="hover:cursor-pointer transition-all duration-300"
            onClick={() => toggleTag(tag)}
            title={tag}
          >
            <Image
              src={tagIcons[tag as keyof typeof tagIcons]}
              alt={`${tag} filter`}
              width={30}
              height={30}
              style={{
                filter: selectedTags.includes(tag)
                  ? "none"
                  : "grayscale(1) opacity(0.2)",
              }}
            />
          </button>
        ))}
      </div>

      {/* Blog lang selection */}
      <div className="flex justify-center items-center gap-2 mb-2">
        {/* 
        // Marked out "All" option for now
        <button
          type="button"
          className={selectionButtonClass}
          onClick={() => setSelectedLang("all")}
        >
          <p
            className={innerButtonClass + " text-2xl"}
            style={{
              filter:
                selectedLang === "all" ? "none" : "grayscale(1) opacity(0.2)",
            }}
          >
            ALL
          </p>
        </button> */}
        <button
          type="button"
          className={selectionButtonClass}
          onClick={() => setSelectedLang("he_IL")}
        >
          <Image
            className={innerButtonClass}
            style={{
              filter:
                selectedLang === "he_IL" ? "none" : "grayscale(1) opacity(0.2)",
            }}
            width={54}
            height={54}
            src="/ui/israel-flag.png"
            alt="Hebrew Language"
          />
        </button>
        <button
          type="button"
          className={selectionButtonClass}
          onClick={() => setSelectedLang("en_US")}
        >
          <Image
            className={innerButtonClass}
            style={{
              filter:
                selectedLang === "en_US" ? "none" : "grayscale(1) opacity(0.2)",
            }}
            width={54}
            height={54}
            src="/ui/uk-flag.png"
            alt="English Language"
          />
        </button>
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
                stringToDate(a.date) < stringToDate(b.date) ? 1 : -1
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
