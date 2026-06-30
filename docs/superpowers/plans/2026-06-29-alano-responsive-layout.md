# Alano Responsive Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the site's outer layout and responsive behavior without changing confirmed content or route logic.

**Architecture:** Keep HTML and JS structure intact, then append a final responsive CSS override layer that standardizes shell layout, navigation behavior, spacing variables, and adaptive grids across pages. This minimizes regression risk inside the existing heavily-overridden stylesheet.

**Tech Stack:** HTML, CSS, Vite, vanilla JavaScript

---

### Task 1: Write Responsive Layout Override

**Files:**
- Modify: `src/styles.css`

- [ ] Add a final override section at the end of `src/styles.css`.
- [ ] Define responsive variables with `clamp()` for shell spacing, sidebar width, content width, titles, copy, and grid gaps.
- [ ] Replace outer shell behavior with mobile-first layout for `.site-shell`, `.sidebar`, `.content`, `.page-section`, `.page-header`.
- [ ] Rebuild navigation behavior for mobile horizontal layout and mobile active underline state.
- [ ] Add tablet and desktop media queries at `680px` and `1024px`.

### Task 2: Convert List Layouts To Adaptive Grids

**Files:**
- Modify: `src/styles.css`

- [ ] Convert `.mobile-image-list` to `repeat(auto-fill, minmax(...))`.
- [ ] Convert `.video-grid` to `repeat(auto-fill, minmax(...))`.
- [ ] Convert `.articles-stack` to `repeat(auto-fill, minmax(...))`.
- [ ] Convert `.contact-links` to `repeat(auto-fill, minmax(...))`.
- [ ] Ensure all card media keep stable proportions with `aspect-ratio`.

### Task 3: Verify No Content Logic Regressions

**Files:**
- Check: `index.html`
- Check: `src/main.js`

- [ ] Confirm no route or content logic changes are required.
- [ ] Ensure existing mobile menu toggle logic does not block the new top navigation layout.

### Task 4: Build And Preview

**Files:**
- Check: project root scripts

- [ ] Run `npm run build` and confirm production build succeeds.
- [ ] Start a local preview server.
- [ ] Confirm the local preview URL responds successfully.
- [ ] Summarize the CSS changes and explain the reason for each change group.
