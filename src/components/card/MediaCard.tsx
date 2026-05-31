import Link from "next/link";
import type { ContentItem } from "@/lib/blog";
import { firstSentences } from "@/lib/text";

/** Strip protocol + trailing slash for a tidy link-button label. */
const cleanLabel = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

const formatDate = (date: string) => {
  const [m, d, y] = date.split(" ")[0].split("/");
  return new Date(`${y}-${m}-${d}`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Horizontal card for an image or a project: image left, header + text right —
 * on every screen size. The card is a fixed height so the image and the text
 * column always match. The description shows a single sentence on mobile; on
 * desktop it fills the remaining height (clipped). On desktop the whole card
 * highlights on hover (navy fill + white text) exactly like the article cards.
 * The whole card links to the detail page (`/pics/<slug>` or `/projects/<slug>`);
 * project link-buttons sit above the navigation overlay so they stay clickable.
 */
const MediaCard: React.FC<{ item: ContentItem }> = ({ item }) => {
  const isProject = item.kind === "project";
  const href = `${isProject ? "/projects" : "/pics"}/${item.slug}`;
  const tools = item.tools
    ? item.tools.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const oneSentence = firstSentences(item.excerpt, 1);

  return (
    <article className="group relative h-56 md:h-72 py-2 md:px-2 md:py-4 md:rounded cursor-pointer transition-colors duration-200 md:hover:bg-[var(--secondary)] md:hover:text-white">
      <div className="flex flex-row gap-4 md:gap-5 h-full">
        <div className="w-1/2 shrink-0 h-full">
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover image-shadow"
          />
        </div>

        <div className="w-1/2 h-full flex flex-col overflow-hidden">
          <span className="text-xs md:text-sm font-medium text-gray-500 transition-colors md:group-hover:text-white font-ui">
            {item.period || formatDate(item.date)}
          </span>
          <h3 className="text-lg md:text-2xl leading-tight">
            {item.title}
          </h3>
          <p className="md:hidden mt-1 text-xs leading-relaxed">{oneSentence}</p>
          <p className="hidden md:block mt-1 text-sm leading-relaxed flex-1 overflow-hidden">
            {item.excerpt}
          </p>

          {isProject && tools.length > 0 && (
            <div className="hidden md:flex flex-wrap gap-1.5 mt-2">
              {tools.map((t) => (
                <span
                  key={t}
                  className="bg-[var(--third)] text-white text-xs px-2 py-0.5 font-ui"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {isProject && item.links && item.links.length > 0 && (
            <div className="relative z-20 flex flex-wrap gap-2 mt-2">
              {item.links.map((l) => (
                <a
                  key={l}
                  href={l}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-button text-xs"
                >
                  {cleanLabel(l)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stretched navigation overlay (kept below the link-buttons' z-index). */}
      <Link
        href={href}
        aria-label={item.title}
        className="absolute inset-0 z-10"
      />
    </article>
  );
};

export default MediaCard;
