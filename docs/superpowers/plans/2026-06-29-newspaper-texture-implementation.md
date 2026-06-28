# Newspaper Texture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a restrained, site-wide newspaper-like paper texture that keeps the current layout and visual logic intact while making text-led pages feel more editorial.

**Architecture:** Implement the effect entirely in CSS using background-layer pseudo-elements and page-specific opacity tuning. Keep the existing HTML structure unless a minimal page identifier hook is absolutely required, and avoid changing content modules, spacing, or component composition.

**Tech Stack:** Vite, static HTML, CSS, vanilla JavaScript

---

### Task 1: Identify Existing Background Hooks

**Files:**
- Modify: none
- Test: `src/styles.css`, `index.html`

- [ ] **Step 1: Write the failing test**

Document the required hooks before any change:

```text
Need to confirm:
- where the global background is drawn
- whether body::before is already used
- whether page-specific selectors exist for articles/about/contact/videos/images
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rg -n "body::before|page-section|#articles|#about|#videos|#images|#contact|data-page" src/styles.css index.html
```

Expected: confirms current hooks but no dedicated newspaper-texture rules yet.

- [ ] **Step 3: Write minimal implementation**

No code change in this task. Record the implementation decision:

```text
Use:
- body::before for the shared global paper field
- page-specific selectors for intensity tuning
- existing page ids (#articles, #about, #contact, #videos, #images) for local overrides
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rg -n "body::before|#articles|#about|#videos|#images|#contact" src/styles.css index.html
```

Expected: existing hooks are confirmed and no HTML restructuring is needed.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-06-29-newspaper-texture-design.md docs/superpowers/plans/2026-06-29-newspaper-texture-implementation.md
git commit -m "docs: plan restrained newspaper texture implementation"
```

### Task 2: Add Global Paper Texture Layer

**Files:**
- Modify: `src/styles.css`
- Test: visual verification through local preview

- [ ] **Step 1: Write the failing test**

Define the expected baseline behavior:

```text
Need a global background texture that:
- is visible but subtle
- does not shift layout
- works in light and dark themes
- does not cover foreground interaction
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rg -n "newspaper|paper-texture|fiber|ink-speck" src/styles.css
```

Expected: no matches before implementation.

- [ ] **Step 3: Write minimal implementation**

Append restrained texture variables and rules near the theme background section in `src/styles.css`:

```css
:root {
  --paper-fiber-opacity: 0.08;
  --paper-speck-opacity: 0.04;
  --paper-wash-opacity: 0.06;
  --page-texture-strength: 1;
}

html[data-theme="dark"] {
  --paper-fiber-opacity: 0.04;
  --paper-speck-opacity: 0.025;
  --paper-wash-opacity: 0.03;
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 1;
  background-image:
    radial-gradient(circle at 14% 18%, rgba(120, 108, 86, var(--paper-speck-opacity)) 0 1px, transparent 1.7px),
    radial-gradient(circle at 78% 34%, rgba(92, 82, 64, var(--paper-speck-opacity)) 0 1px, transparent 1.8px),
    repeating-linear-gradient(90deg, rgba(110, 98, 78, var(--paper-fiber-opacity)) 0 1px, transparent 1px 7px),
    repeating-linear-gradient(0deg, rgba(110, 98, 78, calc(var(--paper-fiber-opacity) * 0.72)) 0 1px, transparent 1px 9px),
    linear-gradient(180deg, rgba(160, 146, 118, var(--paper-wash-opacity)), rgba(255, 255, 255, 0));
  mix-blend-mode: multiply;
}
```

Use very low opacity values and keep `z-index` behind content.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rg -n "paper-fiber-opacity|paper-speck-opacity|body::after" src/styles.css
```

Expected: matches for the new global texture layer.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css
git commit -m "feat: add restrained global paper texture layer"
```

### Task 3: Tune Page-Specific Texture Intensity

**Files:**
- Modify: `src/styles.css`
- Test: visual verification through local preview

- [ ] **Step 1: Write the failing test**

Define the required intensity split:

```text
Need:
- articles/about stronger texture presence
- images/videos weaker texture presence
- contact medium-low texture presence
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rg -n "#articles|#about|#images|#videos|#contact.*texture|page-texture-strength" src/styles.css
```

Expected: no page-specific texture tuning rules before implementation.

- [ ] **Step 3: Write minimal implementation**

Add lightweight per-page overlays in `src/styles.css`:

```css
#articles,
#about,
#contact,
#images,
#videos {
  position: relative;
}

#articles::before,
#about::before,
#contact::before,
#images::before,
#videos::before {
  content: "";
  position: absolute;
  inset: -12px;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  background-image:
    radial-gradient(circle at 22% 26%, rgba(112, 92, 58, 0.06) 0 1px, transparent 1.8px),
    radial-gradient(circle at 76% 68%, rgba(92, 74, 44, 0.05) 0 1px, transparent 2px),
    linear-gradient(180deg, rgba(132, 112, 76, 0.04), transparent 70%);
}

#articles::before,
#about::before {
  opacity: 0.65;
}

#contact::before {
  opacity: 0.38;
}

#images::before,
#videos::before {
  opacity: 0.22;
}

#articles > *,
#about > *,
#contact > *,
#images > *,
#videos > * {
  position: relative;
  z-index: 1;
}
```

Keep the effect low-contrast and behind content only.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rg -n "#articles::before|#about::before|#contact::before|#images::before|#videos::before" src/styles.css
```

Expected: all page-specific overlay selectors are present.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css
git commit -m "feat: tune paper texture intensity by page type"
```

### Task 4: Verify Build And Visual Stability

**Files:**
- Modify: none unless regressions are found
- Test: full app verification

- [ ] **Step 1: Write the failing test**

Define final verification expectations:

```text
Need to prove:
- build still passes
- no layout shift in core pages
- texture is visible but restrained
- text and media remain readable
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run build
```

Expected: if CSS syntax or stacking changes are wrong, build or later preview inspection will expose the issue.

- [ ] **Step 3: Write minimal implementation**

No new code in this task. Start preview and inspect:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Open and review:

```text
http://127.0.0.1:4173/?page=articles
http://127.0.0.1:4173/?page=about
http://127.0.0.1:4173/?page=images
http://127.0.0.1:4173/?page=videos
http://127.0.0.1:4173/?page=contact
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
Invoke-WebRequest -Uri "http://127.0.0.1:4173/?page=articles" -UseBasicParsing
```

Expected: HTTP 200. Manual visual check confirms the texture hierarchy:
- `articles/about` strongest
- `contact` medium-low
- `images/videos` weakest

- [ ] **Step 5: Commit**

```bash
git add src/styles.css
git commit -m "test: verify restrained newspaper texture across pages"
```
