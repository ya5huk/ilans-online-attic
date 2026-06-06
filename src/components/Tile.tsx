import Image from "next/image";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import type { CSSProperties } from "react";
import { tagIcons } from "@/lib/tagIcons";
import type { ContentItem, ContentKind } from "@/lib/blog";

// Feed kind → the short overlay label the user wanted ("blog / img / project").
const TYPE_LABEL: Record<ContentKind, string> = {
  writing: "blog",
  image: "img",
  project: "project",
};

// Feed kind → its detail-route base (matches the old cards' hrefs).
const HREF_BASE: Record<ContentKind, string> = {
  writing: "/yap",
  image: "/pics",
  project: "/projects",
};

// The subjects we have icons for; used to filter a post's frontmatter tags down
// to ones we can actually render in the top strip.
const TAG_KEYS = new Set(Object.keys(tagIcons));

/**
 * A single wall tile: the whole image (or a gradient for image-less posts) inside
 * an accent border (matching the buttons and the about card). A strip across the
 * top filled with that same border color carries the date (left) and type
 * (right); a dark gradient scrim (the tile's own bg color) along the bottom seats
 * the title and keeps its white text legible on any photo without a text-shadow.
 * The parent <JustifiedWall> sizes the tile to the image's exact aspect ratio via
 * the `style` prop, so `object-cover` shows the full image with no crop (and no gap
 * during the hover zoom). Hovering zooms the image gently inside the clipped tile.
 */
const Tile: React.FC<{
  item: ContentItem;
  style?: CSSProperties;
}> = ({ item, style }) => {
  const [mm, dd, yyyy] = item.date.split(" ")[0].split("/");
  const dateLabel = `${yyyy}-${mm}-${dd}`;
  const typeLabel = TYPE_LABEL[item.kind];
  const href = `${HREF_BASE[item.kind]}/${item.slug}`;
  const hasImage = !!item.image && item.image.trim() !== "";
  // Detect Hebrew from the title itself (the bracket range is the Hebrew Unicode
  // block, U+0590–U+05FF) so any kind — not just writing — gets the Hebrew font
  // and right-to-left alignment.
  const isHebrew = /[֐-׿]/.test(item.title);

  // The post's subject tags (writing only — other kinds carry no `tags`), kept
  // in frontmatter order and limited to ones we have an icon for.
  const topicTags = (item.tags ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => TAG_KEYS.has(t));

  return (
    <Link
      href={href}
      aria-label={item.title}
      dir="auto"
      lang={isHebrew ? "he" : undefined}
      style={style}
      className="tile group block overflow-hidden border-2 border-[var(--third)] bg-[var(--secondary)]"
    >
      {hasImage ? (
        // SmartImage: local /public files get next/image optimization (resize,
        // AVIF/WebP); remote markdown URLs fall back to a plain lazy <img>. The
        // tile already reserves exact space, so `fill` keeps the no-CLS guarantee.
        <SmartImage
          src={item.image!}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)] to-[var(--third)] transition-transform duration-200 ease-out group-hover:scale-105" />
      )}

      {/* Scrim tinted with the tile's own bg color (navy) instead of a
          text-shadow: a fade over the bottom third seats the title and keeps its
          white text legible on any photo with no text effect. pointer-events-none
          so it never intercepts the link's hover/click. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--secondary)] to-transparent" />

      {/* Date + type in a strip across the top, filled with the tile's accent
          border color so the row reads as a header bar (not floating text).
          For writing, the post's topic icons sit centered between them. */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 bg-[var(--third)] px-2 py-1">
        <span className="text-[11px] text-white">{dateLabel}</span>
        {topicTags.length > 0 && (
          <span className="flex items-center gap-1.5">
            {topicTags.map((tag) => (
              <Image
                key={tag}
                src={tagIcons[tag as keyof typeof tagIcons]}
                alt=""
                width={14}
                height={14}
                // White, to match the strip's text and read clearly on the accent.
                style={{ filter: "brightness(0) invert(1)" }}
              />
            ))}
          </span>
        )}
        <span className="text-[11px] lowercase text-white">{typeLabel}</span>
      </div>
      {/* Font + weight come from the ".tile" rule in globals.css (one place for all
          card text); here we only handle RTL alignment for Hebrew titles. */}
      <h3
        dir={isHebrew ? "rtl" : undefined}
        className={`absolute inset-x-2 bottom-2 z-10 line-clamp-2 text-lg leading-tight text-white sm:text-2xl${
          isHebrew ? " text-right" : ""
        }`}
      >
        {item.title}
      </h3>
    </Link>
  );
};

export default Tile;
