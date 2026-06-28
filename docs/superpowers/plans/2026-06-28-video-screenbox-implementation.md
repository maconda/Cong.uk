# Video Screenbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing `videos` page with a Worker-backed Screenbox video module that supports dynamic loading and modal playback.

**Architecture:** Keep the current Vite single-page structure and replace only the `videos` section content. Move all user-provided inline styling and scripting into the existing `src/styles.css` and `src/main.js`, with semantic markup left in `index.html`.

**Tech Stack:** Vite, vanilla JavaScript, CSS, static HTML

---

### Task 1: Replace Video Page Markup

**Files:**
- Modify: `index.html`
- Test: manual verification through local preview

- [ ] **Step 1: Write the failing test**

Document the expected DOM contract for the new page:

```text
Expected on ?page=videos:
- #screenboxGrid exists
- #sbPlayerModal exists
- old .featured-video markup no longer exists
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rg -n "screenboxGrid|sbPlayerModal" index.html
```

Expected: no matches for the new markup before implementation.

- [ ] **Step 3: Write minimal implementation**

Replace the current `videos` section in `index.html` with:

```html
<section class="page-section" id="videos" data-page aria-labelledby="videos-title" hidden>
  <header class="page-header video-header">
    <h1 id="videos-title">视频</h1>
    <p class="video-intro">最新投稿视频会从边缘接口动态同步到这里，支持站内预览。</p>
  </header>

  <div class="screenbox-root">
    <div class="screenbox-video-grid" id="screenboxGrid">
      <div class="sk-loading">正在初始化媒体中继流...</div>
    </div>
  </div>

  <div class="screenbox-modal" id="sbPlayerModal" hidden>
    <div class="sb-player-container" role="dialog" aria-modal="true" aria-label="视频播放器">
      <button class="sb-close-btn" type="button" data-sb-close>关闭</button>
      <div id="sbIframeWrapper"></div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rg -n "screenboxGrid|sbPlayerModal" index.html
```

Expected: matches for both new ids.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: replace video page markup with screenbox layout"
```

### Task 2: Add Screenbox Styles

**Files:**
- Modify: `src/styles.css`
- Test: manual verification through local preview

- [ ] **Step 1: Write the failing test**

Document the required style hooks:

```text
Need CSS rules for:
- .screenbox-root
- .screenbox-video-grid
- .sb-video-card
- .screenbox-modal.active
- .sb-player-container
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rg -n "screenbox-root|screenbox-video-grid|sb-video-card|screenbox-modal|sb-player-container" src/styles.css
```

Expected: no matches for the new style hooks before implementation.

- [ ] **Step 3: Write minimal implementation**

Append Screenbox-specific rules to `src/styles.css`, including:

```css
.screenbox-root {
  padding: 20px 0 32px;
}

.screenbox-video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
}

.sb-video-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(12px);
}

.screenbox-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(7, 8, 10, 0.85);
  backdrop-filter: blur(20px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
  z-index: 9999;
}

.screenbox-modal.active {
  opacity: 1;
  pointer-events: auto;
}
```

Include matching child rules for thumbnail box, image scaling, modal container, iframe, close button, loading state, error state, and mobile adjustments.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rg -n "screenbox-root|screenbox-video-grid|sb-video-card|screenbox-modal|sb-player-container" src/styles.css
```

Expected: matches for all required selectors.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css
git commit -m "feat: add screenbox video page styles"
```

### Task 3: Implement Video Loading And Modal Playback

**Files:**
- Modify: `src/main.js`
- Test: manual verification through local preview

- [ ] **Step 1: Write the failing test**

Document the runtime contract:

```text
Need JavaScript that:
- fetches the Worker API
- renders .sb-video-card items into #screenboxGrid
- opens modal on card click
- closes modal and clears iframe on close
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rg -n "screenboxGrid|sbPlayerModal|sbIframeWrapper|workers.dev|sb-video-card" src/main.js
```

Expected: no matches for the new module logic before implementation.

- [ ] **Step 3: Write minimal implementation**

Add a focused Screenbox module in `src/main.js` with:

```js
const SCREENBOX_API_URL = "https://bili-api.httpsaristinotionsitefoodie-57a2611a302c46ae86fc7f2d92a3a.workers.dev/";

function createScreenboxCard(video) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "sb-video-card";
  card.dataset.bvid = video.bvid;
  return card;
}

async function loadScreenboxVideos() {
  const grid = document.getElementById("screenboxGrid");
  if (!grid) return;
}

function openScreenboxPlayer(bvid) {}

function closeScreenboxPlayer() {}
```

Implementation requirements:
- guard against missing DOM nodes
- check `response.ok`
- show error text on failure
- show empty state if API returns no items
- normalize `pic` values to absolute URLs
- add event listeners instead of inline `onclick`
- close on overlay click and close button click

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rg -n "screenboxGrid|sbPlayerModal|sbIframeWrapper|workers.dev|sb-video-card" src/main.js
```

Expected: matches for all major hooks and API usage.

- [ ] **Step 5: Commit**

```bash
git add src/main.js
git commit -m "feat: add screenbox video loader and modal player"
```

### Task 4: Build And Preview Verification

**Files:**
- Modify: none
- Test: full app verification

- [ ] **Step 1: Write the failing test**

Document the required final checks:

```text
- app builds successfully
- preview responds on localhost
- ?page=videos shows the new module
```

- [ ] **Step 2: Run test to verify current state before final verification**

Run:

```bash
npm run build
```

Expected: if implementation is incomplete, build or behavior verification may still reveal problems that need fixing.

- [ ] **Step 3: Write minimal implementation**

No code change in this task. Start local preview for verification:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
Invoke-WebRequest -Uri "http://127.0.0.1:4173/?page=videos" -UseBasicParsing
```

Expected: HTTP 200 and HTML containing `screenboxGrid`.

- [ ] **Step 5: Commit**

```bash
git add index.html src/styles.css src/main.js
git commit -m "test: verify screenbox video page build and preview"
```
