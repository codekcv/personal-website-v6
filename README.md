# personal-website-v6

The personal site of Christian Villamin — a dark, typographic page built on a
live WebGL aurora field.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

Also available: `npm run lint` and `npm run typecheck`.

## Where the content lives

All copy is in **`src/data/site.ts`** — name, role, email, socials, the ethos
statement, the project list, the three principles, the stack. No component
hard-codes text, so editing that one file re-skins the whole page.

The projects in there are placeholders with real-looking shape. Swap them for
actual work; the layout adapts to any number of entries, and each project's
`accent` (`violet` | `cyan` | `gold` | `rose`) drives its hover colour.

## How it's put together

```
src/app/          layout, page, metadata, OG image, robots, sitemap, 404
src/components/   the experience shell and shared primitives
  Experience      owns the field, cursor, threshold and chrome; holds the
                  "stillness" preference that every animated part reads
  AuroraCanvas    a single full-screen fragment shader (raw WebGL2)
  Threshold       the opening — a hairline of light that draws, then opens
  Reveal          RevealWords / RevealChars / Rise / DrawLine
  Nav, CommandPalette, Cursor, ScrollProgress, SmoothScroll
src/components/sections/   Hero, Ethos, Work, Craft, Contact, Footer
```

### The field

`AuroraCanvas` is one draw call: a full-screen triangle generated from
`gl_VertexID` (no buffers), shaded by domain-warped value-noise FBM. Three
ribbons, vertical striations, a starfield, an upper-atmosphere wash, film
grain, and an ACES-ish tone curve. It reacts to the pointer and to scroll
position, pauses when the tab is hidden, and samples its own frame times for
the first 90 frames — if it's struggling it drops resolution and an octave
once, then commits.

Without WebGL2 the CSS gradient beneath it is the design; nothing breaks.

Two things worth knowing before editing it:

- `smoothstep(edge0, edge1, x)` is **undefined** in GLSL when `edge0 >= edge1`.
  Some drivers return NaN, which clamps to black and kills the whole frame.
  Always write the edges in increasing order and invert with `1.0 - …`.
- The effect never calls `WEBGL_lose_context`. The context belongs to the
  canvas, not to the effect, and a Strict Mode remount would re-attach to a
  dead one.

### Why `body` has no background

The field is a `position: fixed; z-index: -10` layer. The root element's
background propagates to the page canvas and paints behind everything, but a
background on `<body>` paints as an ordinary box — *above* negative-z-index
descendants. Giving `<body>` a colour hides the entire field. It is
deliberately `transparent`; the ground colour lives on `html`.

### Gradient text

`background-clip: text` only paints the element's own background, and the
per-character spans used for the reveal are transformed, which breaks the
clip. So `RevealChars` takes a `gradient` prop that paints each glyph with its
own slice of one word-wide gradient (`background-size: n × 100%`, positioned
by index) rather than relying on a single clipping ancestor.

## Motion, and turning it off

Every animated part reads one flag. `prefers-reduced-motion` is the default;
the visitor can override it from the footer or the command palette
(**Enter stillness**), and the choice persists in `localStorage`. With
stillness on: the shader holds a single frame, smooth scrolling and the custom
cursor don't mount, the threshold is skipped, and reveals resolve instantly.

The threshold also plays only once per tab session (`sessionStorage`), and any
key or click skips it.

## Accessibility notes

- Skip link, semantic landmarks, real headings.
- Split text carries `aria-label` on the container; the animated shards are
  `aria-hidden`, so screen readers get whole sentences.
- The command palette (⌘K / Ctrl-K) is fully keyboard-driven — arrows, tab,
  enter, escape — and restores focus to whatever opened it.
- Focus-visible rings everywhere; the custom cursor is fine-pointer only and
  never replaces focus styling.

## Deploying

Static-friendly. `npm run build` prerenders every route; deploy to Vercel or
any Node host. Update `site.domain` in `src/data/site.ts` — it drives
`metadataBase`, the sitemap, robots, and the OG card.
