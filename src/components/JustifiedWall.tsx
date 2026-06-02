"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import justifiedLayout from "justified-layout";
import Tile from "@/components/Tile";
import type { ContentItem } from "@/lib/blog";

// Aspect ratios for items we couldn't measure at build time, so they still get
// a sensible box: a gentle landscape for remote/un-probed photos, a portrait-ish
// card for the image-less typographic tiles.
const FALLBACK_PHOTO_AR = 1.5;
const TYPOGRAPHIC_AR = 0.8;

const aspectOf = (it: ContentItem): number => {
  if (it.width && it.height) return it.width / it.height;
  if (it.image && it.image.trim() !== "") return FALLBACK_PHOTO_AR; // remote/unprobed
  return TYPOGRAPHIC_AR; // image-less post → gradient tile
};

// Larger tiles (fewer per row); still shorter rows on narrow screens.
const rowHeightFor = (w: number): number =>
  w < 500 ? 200 : w < 768 ? 270 : 340;

const GAP = 8;
// max-w-4xl (56rem) — the widest the feed column gets; used for the first server
// render, before the client measures the real width on mount.
const SSR_WIDTH = 896;

/**
 * Justified-rows masonry. Items arrive newest-first; rows fill left→right then
 * down, so reading order stays strictly newest→oldest. Each row shares a height
 * and every tile keeps its true aspect ratio (full image, no crop). The layout
 * re-packs whenever the container width changes.
 */
const JustifiedWall: React.FC<{ items: ContentItem[] }> = ({ items }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(SSR_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geometry = useMemo(
    () =>
      justifiedLayout(items.map(aspectOf), {
        containerWidth: width,
        containerPadding: 0,
        boxSpacing: GAP,
        targetRowHeight: rowHeightFor(width),
      }),
    [items, width]
  );

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{ height: geometry.containerHeight }}
    >
      {geometry.boxes.map((box, i) => {
        const item = items[i];
        return (
          <Tile
            key={`${item.kind}/${item.slug}`}
            item={item}
            style={{
              position: "absolute",
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
            }}
          />
        );
      })}
    </div>
  );
};

export default JustifiedWall;
