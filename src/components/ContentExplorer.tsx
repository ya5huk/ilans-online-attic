"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BlogCard from "@/components/card/BlogCard";
import MediaCard from "@/components/card/MediaCard";
import { tagIcons } from "@/lib/tagIcons";
import type { ContentItem } from "@/lib/blog";

export type ContentMode = "writing" | "image" | "project" | "all";
export type Lang = "all" | "en_US" | "he_IL";

// Display order requested for the tag row (NOT tagIcons key order).
const TAG_ORDER = ["philosophy", "training", "books", "travel", "code"] as const;

interface ContentExplorerProps {
  // Which feed to show — driven by the route (/ , /writing, /images, /projects).
  initialContent: ContentMode;
  // Writing-only filters, seeded from the URL query (?lang= & ?subjects=) so
  // shared links reproduce the view; React state takes over after first paint.
  initialLang?: Lang;
  initialTags?: string[];
  posts: ContentItem[];
  images: ContentItem[];
  projects: ContentItem[];
  all: ContentItem[]; // pre-sorted newest-first on the server
}

// Small block buttons. Identical box in both states (same border + padding) so
// selecting one never changes its footprint — only the fill/text color flips.
const blockClass = (active: boolean) =>
  `border-2 border-[var(--third)] px-2.5 py-1 text-xs sm:text-sm lowercase hover:cursor-pointer ${
    active
      ? "bg-[var(--third)] text-white"
      : "text-[var(--secondary)] hover:bg-[#e4f3f3]"
  }`;

/** A lowercase text picker rendered as a small block button (client filter). */
const Picker: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} className={blockClass(active)}>
    {children}
  </button>
);

/** Same block styling, but a real navigation link (content type lives in the URL). */
const LinkPicker: React.FC<{
  href: string;
  active: boolean;
  children: React.ReactNode;
}> = ({ href, active, children }) => (
  <Link href={href} className={blockClass(active)}>
    {children}
  </Link>
);

/** A tag picker block: icon + lowercase label (icon goes white when active). */
const TagPicker: React.FC<{
  tag: string;
  active: boolean;
  onClick: () => void;
}> = ({ tag, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${blockClass(active)} flex items-center gap-1.5`}
  >
    <Image
      src={tagIcons[tag as keyof typeof tagIcons]}
      alt={tag}
      width={16}
      height={16}
      style={{
        filter: active
          ? "brightness(0) invert(1)"
          : "grayscale(1) opacity(0.5)",
      }}
    />
    <span>{tag}</span>
  </button>
);

const ContentExplorer: React.FC<ContentExplorerProps> = ({
  initialContent,
  initialLang = "en_US",
  initialTags = [],
  posts,
  images,
  projects,
  all,
}) => {
  // Content type is route-driven (a prop); only the writing filters are local
  // state — kept in sync with the URL query so the view stays shareable.
  const content = initialContent;
  const [lang, setLang] = useState<Lang>(initialLang);
  const [tags, setTags] = useState<string[]>(initialTags);

  const isWriting = content === "writing";

  // Mirror the writing filters into the URL without a navigation/scroll jump.
  // Defaults (en_US, no tags) are omitted to keep links clean. These controls
  // only render on /writing, so the path is always /writing here.
  const syncUrl = (nextLang: Lang, nextTags: string[]) => {
    const params = new URLSearchParams();
    if (nextLang !== "en_US") params.set("lang", nextLang);
    if (nextTags.length > 0) params.set("subjects", nextTags.join(","));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/writing?${qs}` : "/writing");
  };

  const changeLang = (nextLang: Lang) => {
    setLang(nextLang);
    syncUrl(nextLang, tags);
  };

  const toggleTag = (tag: string) => {
    const next = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];
    setTags(next);
    syncUrl(lang, next);
  };

  const clearTags = () => {
    setTags([]);
    syncUrl(lang, []);
  };

  // --- Writing feed (filtered + grouped by year; arrays arrive newest-first) ---
  const renderWriting = () => {
    let filtered = posts;
    if (lang !== "all") filtered = filtered.filter((p) => p.lang === lang);
    if (tags.length > 0) {
      filtered = filtered.filter(
        (p) =>
          p.tags &&
          tags.some((t) =>
            p.tags!
              .split(",")
              .map((s) => s.trim())
              .includes(t)
          )
      );
    }

    if (filtered.length === 0) {
      return (
        <p className="text-center text-gray-400 mt-10">
          Nothing here with these filters (yet).
        </p>
      );
    }

    const byYear: Record<string, ContentItem[]> = {};
    filtered.forEach((p) => {
      const year = p.date.split(" ")[0].split("/")[2];
      (byYear[year] ??= []).push(p);
    });
    const years = Object.keys(byYear).sort().reverse();

    return years.map((year) => (
      <div key={year}>
        <div className="flex items-center gap-4 w-full">
          <span className="flex-grow h-1 bg-[var(--secondary)]" />
          <h3 className="text-xl sm:text-3xl tracking-widest">{year}</h3>
          <span className="flex-grow h-1 bg-[var(--secondary)]" />
        </div>
        {byYear[year].map((post, idx) => (
          <div key={post.slug}>
            <BlogCard post={post} />
            {idx !== byYear[year].length - 1 && (
              <span className="block h-0.5 bg-[var(--secondary)]" />
            )}
          </div>
        ))}
      </div>
    ));
  };

  // Thin navy divider between cards (matches the articles feed). Spacing comes
  // from the cards' own padding/margin, so the divider itself has no margin.
  const divider = <span className="block h-0.5 bg-[var(--secondary)]" />;

  const renderMedia = (items: ContentItem[]) =>
    items.length === 0 ? (
      <p className="text-center text-gray-400 mt-10">Nothing here yet.</p>
    ) : (
      <div>
        {items.map((it, idx) => (
          <div key={it.slug}>
            <MediaCard item={it} />
            {idx !== items.length - 1 && divider}
          </div>
        ))}
      </div>
    );

  // --- Interleaved feed: everything by date, rendered per kind ---
  const renderAll = () => (
    <div>
      {all.map((it, idx) => (
        <div key={`${it.kind}/${it.slug}`}>
          {it.kind === "writing" ? (
            <BlogCard post={it} />
          ) : (
            <MediaCard item={it} />
          )}
          {idx !== all.length - 1 && divider}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-2">
      {/* Filters: content, then (writing only) language + subjects.
          Labels share a left column so the picker rows line up. */}
      <div className="mt-2 flex justify-center">
        <div className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-3">
          {/* content */}
          <span className="pt-1.5 text-xs sm:text-sm text-gray-500 select-none font-ui">
            content
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <LinkPicker href="/" active={content === "all"}>
              all
            </LinkPicker>
            <LinkPicker href="/writing" active={isWriting}>
              i wrote this
            </LinkPicker>
            <LinkPicker href="/images" active={content === "image"}>
              images
            </LinkPicker>
            <LinkPicker href="/projects" active={content === "project"}>
              projects
            </LinkPicker>
          </div>

          {/* language (writing only) */}
          {isWriting && (
            <>
              <span className="pt-1.5 text-xs sm:text-sm text-gray-500 select-none font-ui">
                language
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Picker active={lang === "all"} onClick={() => changeLang("all")}>
                  all
                </Picker>
                <Picker
                  active={lang === "en_US"}
                  onClick={() => changeLang("en_US")}
                >
                  english
                </Picker>
                <Picker
                  active={lang === "he_IL"}
                  onClick={() => changeLang("he_IL")}
                >
                  hebrew
                </Picker>
              </div>
            </>
          )}

          {/* subjects (writing only) */}
          {isWriting && (
            <>
              <span className="pt-1.5 text-xs sm:text-sm text-gray-500 select-none font-ui">
                subjects
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Picker active={tags.length === 0} onClick={clearTags}>
                  all
                </Picker>
                {TAG_ORDER.map((tag) => (
                  <TagPicker
                    key={tag}
                    tag={tag}
                    active={tags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="mt-6">
        {content === "writing" && renderWriting()}
        {content === "image" && renderMedia(images)}
        {content === "project" && renderMedia(projects)}
        {content === "all" && renderAll()}
      </div>
    </div>
  );
};

export default ContentExplorer;
