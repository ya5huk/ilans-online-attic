# In-article justified media rows — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pack runs of 2+ consecutive images/videos in a blog post into justified rows on desktop (side-by-side "if they fit, they fit", like the landing wall), stacking on mobile, including videos.

**Architecture:** At build time the markdown pipeline detects runs of consecutive media, replaces each with a `<!--MEDIAROW:k-->` marker, and returns the run's items (with build-time aspect ratios for local images). A shared server component `ArticleBody` splits the rendered HTML on those markers and drops a client `MediaRow` between the static chunks. `MediaRow` reuses the `justified-layout` package, measuring real element sizes on load so rotated photos, rotated videos, and remote images are correct.

**Tech Stack:** Next.js (App Router, server + client components), `remark`/`remark-html`, `image-size`, `justified-layout`, Tailwind v4. **No test runner exists in this repo** (scripts are only dev/build/start/lint), so verification is: `npm run lint`, `npm run build` (type-checks **and** runs the real pipeline on every post during static generation — a true integration check), an ad-hoc Node detection check, and a dev-server visual pass. Do **not** run `npm run build` while `npm run dev` is running (shared `.next/` cache).

---

## File structure

- **Modify `src/lib/blog.ts`** — `MediaItem` type, `mediaRows` on `ContentItem`, `probeAspect()`, `groupMediaRuns()`, thread `mediaRows` through `processMarkdown`/`toItem`/`getItemBySlug`.
- **Create `src/components/MediaRow.tsx`** (`"use client"`) — justified packing of a media run with captions.
- **Create `src/components/ArticleBody.tsx`** (server) — split HTML on markers, interleave `MediaRow`.
- **Modify `src/app/(site-routes)/yap/[articlename]/page.tsx`** — render via `ArticleBody`.
- **Modify `src/components/DetailView.tsx`** — render body via `ArticleBody`.
- **Modify `src/app/globals.css`** — `.media-rows` / `.media-row` layout.

**Commit strategy (each commit compiles and renders correctly):**
1. Pipeline returns `mediaRows`, grouping still **off** (`getItemBySlug` passes `false`) → behavior unchanged.
2. Add `MediaRow` + `ArticleBody` + CSS (not yet wired) → unused but compiles.
3. Wire both pages to `ArticleBody` **and** flip grouping **on** in the same commit → markers emitted and handled together.

---

## Task 1: Build-time detection + pipeline wiring (`src/lib/blog.ts`), grouping OFF

**Files:** Modify `src/lib/blog.ts`

- [ ] **Step 1: Add the remote-URL regex** next to `videoExtensions` (line 10).

```ts
const videoExtensions = /\.(mp4|webm)$/i;
const remoteRe = /^https?:\/\//i;
```

- [ ] **Step 2: Add `MediaItem` and `mediaRows`** to the types. Add the interface just above `export interface ContentItem` (line 104), and a field inside `ContentItem`.

```ts
export interface MediaItem {
  type: "image" | "video";
  src: string;
  alt: string;
  /** Orientation-corrected width/height for a LOCAL image, probed at build.
   *  Undefined for videos/remote → measured in the browser by <MediaRow>. */
  aspect?: number;
}
```

Inside `ContentItem`, add after `content: string;` / `excerpt: string;`:

```ts
  mediaRows?: MediaItem[][]; // runs of 2+ consecutive media; only on single-item fetches
```

- [ ] **Step 3: Add `probeAspect()`** below `probeImageDimensions` (after line 36). It reuses the same header-only read but corrects for EXIF orientation.

```ts
/**
 * Orientation-corrected aspect ratio (width / height) for a LOCAL image, read
 * header-only at build time. Phone photos carry EXIF orientation (5–8 = rotated
 * 90°/270°), so the displayed aspect swaps the probed dimensions. Remote URLs and
 * unreadable/zero-size files return undefined → <MediaRow> measures them instead.
 */
function probeAspect(src: string): number | undefined {
  if (!src || remoteRe.test(src)) return undefined;
  try {
    const rel = decodeURIComponent(src).replace(/^\/+/, "");
    const buf = fs.readFileSync(path.join(process.cwd(), "public", rel));
    const { width, height, orientation } = imageSize(buf);
    if (!width || !height) return undefined;
    const rotated = !!orientation && orientation >= 5;
    const w = rotated ? height : width;
    const h = rotated ? width : height;
    return w / h;
  } catch {
    return undefined;
  }
}
```

- [ ] **Step 4: Add `groupMediaRuns()`** above `processMarkdown` (before line 84). Pure string transform — no fs.

```ts
// A media paragraph as emitted by remark-html: one block per line, image only.
const MEDIA_LINE = /^<p><img src="([^"]*)"(?: alt="([^"]*)")?\s*\/?><\/p>$/;

/**
 * Find runs of 2+ consecutive media paragraphs in the remark HTML (remark emits
 * one block element per line, so consecutive `![](…)` become adjacent
 * `<p><img></p>` lines — videos included, since markdown image syntax renders as
 * <img> regardless of extension). Each run is replaced by a `<!--MEDIAROW:k-->`
 * marker and collected into `runs[k]`; a lone media line is left untouched for the
 * normal figure/video treatment in addImageCaptions. Aspect probing is done by the
 * caller so this stays pure.
 */
function groupMediaRuns(htmlStr: string): { html: string; runs: MediaItem[][] } {
  const lines = htmlStr.split("\n");
  const out: string[] = [];
  const runs: MediaItem[][] = [];
  let i = 0;
  while (i < lines.length) {
    if (MEDIA_LINE.test(lines[i])) {
      const run: MediaItem[] = [];
      let j = i;
      for (let m = lines[j].match(MEDIA_LINE); m; m = lines[j]?.match(MEDIA_LINE)) {
        const src = m[1];
        run.push({
          type: videoExtensions.test(src) ? "video" : "image",
          src,
          alt: m[2] ?? "",
        });
        j++;
      }
      if (run.length >= 2) {
        out.push(`<!--MEDIAROW:${runs.length}-->`);
        runs.push(run);
      } else {
        out.push(lines[i]); // single media → unchanged
      }
      i = j;
    } else {
      out.push(lines[i]);
      i++;
    }
  }
  return { html: out.join("\n"), runs };
}
```

- [ ] **Step 5: Thread grouping through `processMarkdown`.** Replace the whole function (lines 84–100) with the version below — adds a `groupMedia` flag (default `false`) and a `mediaRows` return value.

```ts
/** Shared markdown pipeline: frontmatter split + remark→HTML + captions + excerpt.
 *  When groupMedia is set, runs of 2+ consecutive media are pulled into mediaRows
 *  and replaced by <!--MEDIAROW:k--> markers for <ArticleBody> to render. */
async function processMarkdown(raw: string, excerptLength = 150, groupMedia = false) {
  const matterResult = matter(raw);

  const processed = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(matterResult.content);

  let htmlStr = processed.toString();
  let mediaRows: MediaItem[][] = [];

  if (groupMedia) {
    const grouped = groupMediaRuns(htmlStr);
    htmlStr = grouped.html;
    mediaRows = grouped.runs.map((run) =>
      run.map((it) =>
        it.type === "image" ? { ...it, aspect: probeAspect(it.src) } : it
      )
    );
  }

  const content = addImageCaptions(htmlStr);

  const plain = toPlainText(matterResult.content);
  const excerpt =
    plain.slice(0, excerptLength) + (plain.length > excerptLength ? "..." : "");

  return { data: matterResult.data, content, excerpt, mediaRows };
}
```

- [ ] **Step 6: Pass `mediaRows` through `toItem`.** Change the signature (line 124) and the `base` object (line 134).

Signature — add a trailing param:

```ts
function toItem(
  slug: string,
  kind: ContentKind,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  content: string,
  excerpt: string,
  mediaRows: MediaItem[][] = []
): ContentItem {
```

`base` object — add the field:

```ts
  const base: ContentItem = {
    kind,
    slug,
    title: data.title,
    date: data.date,
    image: data.image,
    width: dims?.width,
    height: dims?.height,
    content,
    excerpt,
    mediaRows,
  };
```

- [ ] **Step 7: Enable grouping on single-item fetch only.** In `getItemBySlug` (around line 212) pass `true` and forward `mediaRows`. `getCollection` is left as-is (grouping stays off for the feed).

```ts
    const { data, content, excerpt, mediaRows } = await processMarkdown(
      raw,
      200,
      true
    );
    return toItem(slug, kind, data, content, excerpt, mediaRows);
```

- [ ] **Step 8: Lint.**

Run: `npm run lint`
Expected: no errors for `src/lib/blog.ts` (warnings unrelated to this file are pre-existing).

- [ ] **Step 9: Ad-hoc detection check** — confirms the rule still matches the data established during design (the implementation mirrors this markdown-level adjacency at the HTML level).

Run:

```bash
node -e '
const fs=require("fs"),path=require("path");
const runs={};
for (const f of fs.readdirSync("posts").filter(f=>f.endsWith(".md"))) {
  const body=fs.readFileSync(path.join("posts",f),"utf8").replace(/^---[\s\S]*?---\n/,"");
  const lines=body.split("\n");
  const isImg=l=>/^!\[[^\]]*\]\([^)]*\)\s*$/.test(l.trim()), isBlank=l=>l.trim()==="";
  let i=0; while(i<lines.length){ if(isImg(lines[i])){let c=1,j=i+1; while(j<lines.length){if(isBlank(lines[j])){j++;continue} if(isImg(lines[j])){c++;j++;continue} break} if(c>=2) runs[c]=(runs[c]||0)+1; i=j;} else i++; }
}
console.log(JSON.stringify(runs));
'
```

Expected: `{"2":14,"3":3,"4":1,"6":1}`

- [ ] **Step 10: Commit** (grouping is wired but OFF at the type level only — `getItemBySlug` now emits markers; since no renderer consumes them yet this is the last step of commit 1, paired with nothing visual. To keep this commit non-breaking, **temporarily** verify the detail pages still show media before committing — they will show raw markers until Task 4. If you are committing per-task, instead set the flag in Step 7 to `false` now and flip it to `true` in Task 4's commit.)

> **Recommended:** keep Step 7 as `false` for this commit, flip to `true` in Task 4. This guarantees commit 1 is non-breaking. The code below assumes that choice.

Change Step 7's call to `processMarkdown(raw, 200, false)` for this commit, then:

```bash
git add src/lib/blog.ts
git commit -m "feat(blog): media-run detection + aspect probing (grouping off)"
```

---

## Task 2: `MediaRow` client component

**Files:** Create `src/components/MediaRow.tsx`

- [ ] **Step 1: Write the component.**

```tsx
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
```

- [ ] **Step 2: Lint.**

Run: `npm run lint`
Expected: no errors for `src/components/MediaRow.tsx`.

---

## Task 3: `ArticleBody` server component

**Files:** Create `src/components/ArticleBody.tsx`

- [ ] **Step 1: Write the component.**

```tsx
import type { CSSProperties } from "react";
import type { MediaItem } from "@/lib/blog";
import MediaRow from "@/components/MediaRow";

const MARKER = /<!--MEDIAROW:(\d+)-->/g;

/**
 * Renders article HTML that may contain `<!--MEDIAROW:k-->` markers (inserted by
 * the markdown pipeline where 2+ consecutive images/videos appeared). HTML between
 * markers is rendered as-is inside a display:contents wrapper (so .prose child
 * styling is unaffected); each marker becomes a <MediaRow> that packs its run. With
 * no markers it renders identically to a plain dangerouslySetInnerHTML article.
 */
const ArticleBody: React.FC<{
  content: string;
  mediaRows?: MediaItem[][];
  className?: string;
  style?: CSSProperties;
}> = ({ content, mediaRows = [], className, style }) => {
  // String.split with a capturing regex interleaves the captured index:
  // [html, "0", html, "1", html, ...] → even = HTML, odd = run index.
  const parts = content.split(MARKER);
  return (
    <article className={className} style={style}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <MediaRow key={`row-${i}`} items={mediaRows[Number(part)] ?? []} />
        ) : part ? (
          <div
            key={`html-${i}`}
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{ __html: part }}
          />
        ) : null
      )}
    </article>
  );
};

export default ArticleBody;
```

- [ ] **Step 2: Lint.**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit** (components added, not yet used).

```bash
git add src/components/MediaRow.tsx src/components/ArticleBody.tsx
git commit -m "feat(blog): add MediaRow + ArticleBody for justified media runs"
```

---

## Task 4: Wire pages to `ArticleBody` + turn grouping ON

**Files:** Modify `src/app/(site-routes)/yap/[articlename]/page.tsx`, `src/components/DetailView.tsx`, `src/lib/blog.ts`

- [ ] **Step 1: Flip grouping on** in `src/lib/blog.ts` `getItemBySlug` (the call edited in Task 1 Step 7) back to `true`:

```ts
    const { data, content, excerpt, mediaRows } = await processMarkdown(
      raw,
      200,
      true
    );
    return toItem(slug, kind, data, content, excerpt, mediaRows);
```

- [ ] **Step 2: Import `ArticleBody`** in the yap page (top of `src/app/(site-routes)/yap/[articlename]/page.tsx`, with the other imports):

```ts
import ArticleBody from "@/components/ArticleBody";
```

- [ ] **Step 3: Replace the article element** in the yap page (lines 134–141) with:

```tsx
        {/* Content */}
        <ArticleBody
          content={post.content}
          mediaRows={post.mediaRows}
          className={`prose prose-lg max-w-none pt-2 ${isHebrew ? "prose-right" : ""}`}
          style={{ direction: isHebrew ? "rtl" : "ltr" }}
        />
```

- [ ] **Step 4: Import `ArticleBody`** in `src/components/DetailView.tsx` (top of file):

```ts
import ArticleBody from "@/components/ArticleBody";
```

- [ ] **Step 5: Replace the `body` const** in `DetailView.tsx` (lines 30–35) with:

```tsx
  const body = (
    <ArticleBody
      content={item.content}
      mediaRows={item.mediaRows}
      className="prose prose-lg max-w-none"
    />
  );
```

- [ ] **Step 6: Lint.**

Run: `npm run lint`
Expected: no errors.

---

## Task 5: CSS for justified rows

**Files:** Modify `src/app/globals.css`

- [ ] **Step 1: Append the media-row rules** at the end of the prose section (after the `.prose figcaption` block, ~line 166, or at end of file).

```css
/* In-article justified media rows (2+ consecutive images/videos). Packing is done
   in <MediaRow>; each row is a flexbox whose children grow in proportion to their
   aspect ratio (set inline), so items in a row share one height and show the full
   image (no crop). On narrow widths <MediaRow> emits one item per row → stacked. */
.media-rows {
  @apply my-6;
}
.media-row {
  @apply flex items-start gap-2;
}
.media-row + .media-row {
  @apply mt-2;
}
.media-row > figure {
  @apply m-0 min-w-0; /* flex child: cancel .prose figure margins; allow shrink */
}
.media-row figure img,
.media-row figure video {
  @apply m-0 block h-auto w-full; /* override .prose img mx-auto/my-6; keep teal shadow */
  max-height: none; /* override .prose img md:max-h-[480px] inside rows */
}
.media-row figcaption {
  @apply mt-2 text-center text-sm italic text-gray-400;
}
```

- [ ] **Step 2: Commit** (feature now live end-to-end).

```bash
git add src/lib/blog.ts src/app/'(site-routes)'/yap/'[articlename]'/page.tsx src/components/DetailView.tsx src/app/globals.css
git commit -m "feat(blog): render consecutive media as justified rows (stacked on mobile)"
```

---

## Task 6: Integration verification

**Files:** none (verification only)

- [ ] **Step 1: Type-check + full pipeline via build.** Ensure no dev server is running first.

Run: `npm run build`
Expected: build succeeds; `/yap/*`, `/pics/*`, `/projects/*` static params generate with no errors. (This runs `groupMediaRuns` + `probeAspect` on every post — a real integration test.)

- [ ] **Step 2: Confirm markers + data exist** in the generated output for a known pair (december).

Run:

```bash
grep -rl "MEDIAROW" .next/server/app 2>/dev/null | head || echo "check rendered page instead"
```

Expected: at least one match, **or** verify visually in the next step (markers are consumed into React props, so they may not appear literally in the HTML — visual check is authoritative).

- [ ] **Step 3: Visual check.** Start the dev server and inspect:

Run: `npm run dev` (then open the URLs; stop the server when done)

- `/yap/december_training` — the gym + clean-fail pair sits **side-by-side** on a wide window; the laundry + apartment pair too. Captions sit under each. Narrow the window to phone width → they **stack**.
- `/yap/march_april_2026_track` — a run that includes **videos** packs (portrait video beside portrait video; a landscape video on its own row); videos still play with controls.
- `/yap/hod_akev_ein_akev_divshon_rise` — images separated by text are **unchanged** (single, centered).
- `/pics/<any>` and `/projects/<any>` — render normally (no regression; these have no runs today).
- `/yap/my_first_project_hebrew` — RTL post with remote images still renders; remote-image runs pack after the browser measures them (brief settle is expected).

- [ ] **Step 4: Commit** any visual fixes (e.g., tuning `TARGET_ROW_HEIGHT` or row gap) discovered during Step 3.

```bash
git add -A && git commit -m "fix(blog): tune justified media row sizing"
```

---

## Self-review notes

- **Spec coverage:** detection of 2+ runs (Task 1) ✓; videos included (MEDIA_LINE matches any `<p><img>`; type by extension) ✓; landing-wall packing (Task 2, justified-layout) ✓; stacked on mobile (one-per-row at narrow width — no special branch) ✓; captions under each (Task 2 `<figcaption>`) ✓; single/text-separated images unchanged (run length 1 left untouched; grouping opt-in) ✓; EXIF orientation (Task 1 `probeAspect`) ✓; no new deps ✓; all full-content renderers covered (yap + DetailView → ArticleBody) ✓.
- **Type consistency:** `MediaItem` (`type`/`src`/`alt`/`aspect`) used identically in `blog.ts`, `MediaRow`, `ArticleBody`. `groupMediaRuns` returns `{ html, runs }`; `processMarkdown` returns `{ data, content, excerpt, mediaRows }`; `toItem` 6th param `mediaRows`.
- **No placeholders:** all code is concrete.
- **Known trade-off:** rows containing video/remote settle briefly on load (measured client-side); image-only rows use build-time aspect so desktop image rows don't shift. Documented in spec.
