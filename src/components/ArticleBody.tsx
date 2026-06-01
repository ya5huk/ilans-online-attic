import type { CSSProperties } from "react";
import type { BodyPart, MediaItem } from "@/lib/blog";
import MediaRow from "@/components/MediaRow";

/**
 * Renders an article body from ordered parts (built in the markdown pipeline):
 * `{ html }` chunks are dropped in via dangerouslySetInnerHTML inside a
 * display:contents wrapper (so .prose child styling is unaffected); `{ run }`
 * parts become a <MediaRow> that packs that run of 2+ images/videos. No marker
 * strings are ever stored or serialized.
 */
const ArticleBody: React.FC<{
  parts: BodyPart[];
  mediaRows?: MediaItem[][];
  className?: string;
  style?: CSSProperties;
}> = ({ parts, mediaRows = [], className, style }) => {
  return (
    <article className={className} style={style}>
      {parts.map((part, i) =>
        "run" in part ? (
          <MediaRow key={i} items={mediaRows[part.run] ?? []} />
        ) : (
          <div
            key={i}
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{ __html: part.html }}
          />
        )
      )}
    </article>
  );
};

export default ArticleBody;
