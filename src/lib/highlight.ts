import { createHighlighterCore, type HighlighterCore } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import type { Root, RootContent } from "mdast";

/* Build-time syntax highlighting. Fine-grained @shikijs/* imports (no meta
   `shiki` package, no oniguruma WASM) keep the size-constrained [feed] lambda
   small — see next.config.ts. */

const THEME = "gruvbox-dark-medium";

// Grammars actually used by posts. `vue` auto-registers its embedded
// html/css/js/ts grammars, so future ```html / ```css fences work too.
let highlighterPromise: Promise<HighlighterCore> | null = null;
function getHighlighter() {
  highlighterPromise ??= createHighlighterCore({
    themes: [import("@shikijs/themes/gruvbox-dark-medium")],
    langs: [
      import("@shikijs/langs/python"),
      import("@shikijs/langs/bash"),
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/vue"),
      import("@shikijs/langs/vue-html"),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}

/** remark plugin: swap each fenced code block WITH a known language for a
 *  pre-highlighted raw-html node (the same trusted path raw HTML takes through
 *  remark-html {sanitize:false}) BEFORE serialization — so everything outside
 *  code blocks stays byte-identical for the regex post-processors in blog.ts.
 *  Lang-less or unknown-lang fences are left as plain <pre><code>, which
 *  globals.css styles as the same dark panel, just untokenized. */
export function remarkShiki() {
  return async (tree: Root) => {
    const tasks: Promise<void>[] = [];
    const walk = (node: { children?: RootContent[] }) => {
      node.children?.forEach((child, i) => {
        if (child.type === "code" && child.lang) {
          tasks.push(
            getHighlighter().then((hl) => {
              try {
                const highlighted = hl.codeToHtml(child.value, {
                  lang: child.lang!,
                  theme: THEME,
                  // gruvbox bg → --secondary (#2b2118, see globals.css :root)
                  colorReplacements: { "#282828": "#2b2118" },
                });
                node.children![i] = { type: "html", value: highlighted };
              } catch {
                /* unknown language → keep the plain block */
              }
            })
          );
        } else if ("children" in child) {
          walk(child);
        }
      });
    };
    walk(tree);
    await Promise.all(tasks);
  };
}
