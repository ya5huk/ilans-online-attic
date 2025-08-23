"use client";

import { useState, useEffect } from "react";
import BlogCard from "@/components/card/BlogCard";
import { BlogPost } from "@/lib/blog";
import Image from "next/image";

interface BlogListProps {
  posts: BlogPost[];
}

const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  const [selectedLang, setSelectedLang] = useState<"all" | "he_IL" | "en_US">(
    "all"
  );
  const [selectedPosts, setSelectedPosts] = useState<BlogPost[]>(posts);

  useEffect(() => {
    if (selectedLang === "all") {
      setSelectedPosts(posts);
    } else {
      setSelectedPosts(posts.filter((post) => post.lang === selectedLang));
    }
  }, [selectedLang]);

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
    "hover:cursor-pointer transition-colors duration-300 rounded";
  const innerButtonClass = "p-1 transition-colors duration-300";

  return (
    <>
      {/* Blog lang selection */}
      <div className="flex justify-center items-center gap-2 mb-2">
        <button
          type="button"
          className={selectionButtonClass}
          style={{
            backgroundColor:
              selectedLang === "all" ? "var(--third)" : "transparent",
          }}
          onClick={() => setSelectedLang("all")}
        >
          <p
            className={innerButtonClass + " text-2xl"}
            style={{ color: selectedLang === "all" ? "white" : "black" }}
          >
            ALL
          </p>
        </button>
        <button
          type="button"
          className={selectionButtonClass}
          style={{
            backgroundColor:
              selectedLang === "he_IL" ? "var(--third)" : "transparent",
          }}
          onClick={() => setSelectedLang("he_IL")}
        >
          <Image
            className={innerButtonClass}
            style={{
              filter: selectedLang === "he_IL" ? "invert(1)" : "none",
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
          style={{
            backgroundColor:
              selectedLang === "en_US" ? "var(--third)" : "transparent",
          }}
          onClick={() => setSelectedLang("en_US")}
        >
          <Image
            className={innerButtonClass}
            style={{
              filter: selectedLang === "en_US" ? "invert(1)" : "none",
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
