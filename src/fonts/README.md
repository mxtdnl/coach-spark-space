# House fonts

Drop the licensed `.woff2` files for the house faces in this directory, then
declare them in `src/styles.css` and point the typography tokens at them.

Vite fingerprints and bundles anything referenced by a relative `url()` from
`src/styles.css`, so no `public/` copy and no CDN link is needed — the fonts
ship with the build.

## 1. Declare the faces

Add this above the `@theme inline` block in `src/styles.css`, one `@font-face`
per weight actually used. `font-display: swap` keeps text visible while the
file loads, and the explicit `font-weight` lets the browser pick the right
file instead of synthesising a fake bold.

```css
@font-face {
  font-family: "House Sans";
  src: url("./fonts/house-sans-400.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "House Sans";
  src: url("./fonts/house-sans-700.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

A variable font needs a single rule with a weight range instead:
`font-weight: 100 900;`.

## 2. Point the tokens at them

In the typography section of `@theme inline`, put the new family at the front
of the stack and leave the system fonts behind it as the fallback:

```css
--font-sans:
  "House Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
  "Segoe UI Symbol", "Noto Color Emoji";
--font-display: "House Display", var(--font-sans);
```

Nothing else needs touching: `--font-sans` drives body copy and every unmarked
element, and the `h1, h2, h3` rule in `@layer base` picks up `--font-display`.

## Licensing

Only fonts we hold a webfont licence for belong in this directory. Web use is
a separate grant from desktop use in most foundry licences — check the licence
covers self-hosted web embedding before committing a file here.
