"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import justifiedLayout from "justified-layout";
import type { MediaItem } from "@/lib/blog";

const GAP = 8; // px; matches the landing wall and the .media-row CSS gap
const TARGET_ROW_HEIGHT = 340; // desktop row height target (tunable)
const SSR_WIDTH = 768; // content column max (max-w-3xl) — first paint before measuring
const FALLBACK_AR = 1.5; // unmeasured remote/video until the browser reports real size

/** width / height for an item: measured value wins, then build-time aspect, then fallback. */
const aspectOf = (item: MediaItem, measured?: number): number =>
  measured ?? item.aspect ?? FALLBACK_AR;

/**
 * Packs a run of 2+ images/videos into justified rows using the same
 * justified-layout mechanism as the landing wall: "if they fit, they fit" (two
 * verticals share a row; a wide landscape takes its own). Each row is a flexbox
 * whose children grow in proportion to their aspect ratio, so the row shares one
 * height with full (un-cropped) media and every caption flows underneath. Aspect
 * ratios come from build-time probing for local images and are corrected by
 * measuring the real element on load, which also covers videos and remote images.
 * At narrow widths justified-layout naturally returns one item per row — i.e.
 * stacked on mobile.
 */
const MediaRow: React.FC<{ items: MediaItem[] }> = ({ items }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(SSR_WIDTH);
  const [measured, setMeasured] = useState<Record<number, number>>({});

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

  const setAspect = (i: number, ar: number) =>
    setMeasured((prev) =>
      Math.abs((prev[i] ?? 0) - ar) < 0.001 ? prev : { ...prev, [i]: ar }
    );

  const aspects = items.map((it, i) => aspectOf(it, measured[i]));

  // Group item indices into rows at the current width (justified-layout decides breaks).
  const rows = useMemo(() => {
    const geo = justifiedLayout(aspects, {
      containerWidth: width,
      containerPadding: 0,
      boxSpacing: GAP,
      targetRowHeight: TARGET_ROW_HEIGHT,
    });
    const byTop = new Map<number, number[]>();
    geo.boxes.forEach((b, i) => {
      const arr = byTop.get(b.top) ?? [];
      arr.push(i);
      byTop.set(b.top, arr);
    });
    return [...byTop.entries()].sort((a, b) => a[0] - b[0]).map(([, idx]) => idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspects.join(","), width]);

  return (
    <div ref={ref} className="media-rows">
      {rows.map((row, r) => (
        <div className="media-row" key={r}>
          {row.map((i) => {
            const it = items[i];
            return (
              <figure key={i} style={{ flexGrow: aspects[i], flexBasis: 0 }}>
                {it.type === "video" ? (
                  <video
                    src={it.src}
                    controls
                    playsInline
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget;
                      if (v.videoWidth && v.videoHeight)
                        setAspect(i, v.videoWidth / v.videoHeight);
                    }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.src}
                    alt={it.alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={(e) => {
                      const im = e.currentTarget;
                      if (im.naturalWidth && im.naturalHeight)
                        setAspect(i, im.naturalWidth / im.naturalHeight);
                    }}
                  />
                )}
                {it.alt ? <figcaption>{it.alt}</figcaption> : null}
              </figure>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MediaRow;
