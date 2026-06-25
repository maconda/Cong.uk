# Clean Main Repo Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the repository to one clean top-level project tree and remove all Windows conflict-copy clutter before publishing to GitHub.

**Architecture:** Keep the top-level Vite site as the single source of truth. Remove duplicate conflict-copy files in the repo root and delete the nested `cong.uk/` repository content so the outer repo has one canonical README, one canonical package manifest, one canonical test set, and one canonical license set. Verify the cleaned tree still builds and that Git only shows the intended removals.

**Tech Stack:** Git, PowerShell, Vite, Playwright.

---

### Task 1: Confirm the canonical tree

**Files:**
- Inspect: `README.md`
- Inspect: `LICENSE`
- Inspect: `index.html`
- Inspect: `package.json`
- Inspect: `package-lock.json`
- Inspect: `playwright.config.js`
- Inspect: `tests/desktop-gallery-layout.spec.js`
- Inspect: `cong.uk/README.md`
- Inspect: `cong.uk/LICENSE`

- [ ] **Step 1: Compare the duplicate files to the canonical top-level files**

```powershell
git diff --no-index -- README.md "README(Cong-Windows的冲突副本1_2026-06-26 02-11-37).md"
git diff --no-index -- index.html "index(Cong-Windows的冲突副本1_2026-06-26 02-11-37).html"
git diff --no-index -- package.json "package(Cong-Windows的冲突副本2_2026-06-26 02-11-37).json"
git diff --no-index -- package-lock.json "package-lock(Cong-Windows的冲突副本1_2026-06-26 02-11-38).json"
git diff --no-index -- playwright.config.js "playwrightconfig(Cong-Windows的冲突副本1_2026-06-26 02-11-37).js"
git diff --no-index -- tests/desktop-gallery-layout.spec.js "tests/desktop-gallery-layoutspec(Cong-Windows的冲突副本1_2026-06-26 02-11-38).js"
```

- [ ] **Step 2: Confirm the nested `cong.uk/` folder is only leftover repository content**

```powershell
git ls-tree HEAD cong.uk
Get-ChildItem -Force cong.uk
```

- [ ] **Step 3: Record the canonical rule for the rest of the cleanup**

```text
Top-level files stay.
Conflict-copy files go.
Nested `cong.uk/` repo content goes.
```

### Task 2: Remove duplicate and nested-repo content

**Files:**
- Delete: `README(Cong-Windows的冲突副本1_2026-06-26 02-11-37).md`
- Delete: `index(Cong-Windows的冲突副本1_2026-06-26 02-11-37).html`
- Delete: `package(Cong-Windows的冲突副本2_2026-06-26 02-11-37).json`
- Delete: `package(Cong-Windows的冲突副本1_2026-06-26 00-03-00).json`
- Delete: `package-lock(Cong-Windows的冲突副本1_2026-06-26 02-11-38).json`
- Delete: `playwrightconfig(Cong-Windows的冲突副本1_2026-06-26 02-11-37).js`
- Delete: `tests/desktop-galleryspec(Cong-Windows的冲突副本1_2026-06-26 02-11-38).js`
- Delete: `cong.uk/`
- Keep: `README.md`
- Keep: `LICENSE`
- Keep: `index.html`
- Keep: `package.json`
- Keep: `package-lock.json`
- Keep: `playwright.config.js`
- Keep: `tests/desktop-gallery-layout.spec.js`

- [ ] **Step 1: Remove the untracked Windows conflict-copy files**

```powershell
Remove-Item -LiteralPath @(
  'README(Cong-Windows的冲突副本1_2026-06-26 02-11-37).md',
  'index(Cong-Windows的冲突副本1_2026-06-26 02-11-37).html',
  'package(Cong-Windows的冲突副本2_2026-06-26 02-11-37).json',
  'package(Cong-Windows的冲突副本1_2026-06-26 00-03-00).json',
  'package-lock(Cong-Windows的冲突副本1_2026-06-26 02-11-38).json',
  'playwrightconfig(Cong-Windows的冲突副本1_2026-06-26 02-11-37).js',
  'tests/desktop-galleryspec(Cong-Windows的冲突副本1_2026-06-26 02-11-38).js'
)
```

- [ ] **Step 2: Remove the nested `cong.uk/` repository from the outer repo**

```powershell
git rm -f cong.uk
```

- [ ] **Step 3: Confirm the worktree now contains only the canonical top-level files**

```powershell
git status --short
```

### Task 3: Verify and publish the cleaned repo

**Files:**
- Inspect: `README.md`
- Inspect: `LICENSE`
- Inspect: `package.json`
- Inspect: `index.html`
- Inspect: `src/main.js`
- Inspect: `src/styles.css`
- Inspect: `tests/*.spec.js`

- [ ] **Step 1: Run the production build**

```powershell
npm run build
```

Expected: Vite completes without errors and writes `dist/`.

- [ ] **Step 2: Run the Playwright test suite**

```powershell
npx playwright test
```

Expected: Existing UI tests pass against the cleaned tree.

- [ ] **Step 3: Review the final diff and stage only the intended removals**

```powershell
git diff --stat
git status --short
```

- [ ] **Step 4: Commit the cleanup**

```powershell
git add -A
git commit -m "chore: clean repo structure and remove conflict copies"
```

- [ ] **Step 5: Push the cleaned branch to GitHub**

```powershell
git push origin master
```
