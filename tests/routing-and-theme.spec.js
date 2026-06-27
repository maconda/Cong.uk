import { test, expect } from "@playwright/test";

test("normalizes hash routes without scrolling", async ({ page }) => {
  await page.goto("/#images", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/page=images/);

  const state = await page.evaluate(() => ({
    scrollY: window.scrollY,
    activePage: document.querySelector(".page-section.is-active")?.id,
  }));

  expect(state.scrollY).toBe(0);
  expect(state.activePage).toBe("images");
});

test("opens the image page by default", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/page=images/);

  const state = await page.evaluate(() => ({
    activePage: document.querySelector(".page-section.is-active")?.id,
    activeNavText: document.querySelector(".site-nav a[aria-current='page']")?.textContent?.trim(),
  }));

  expect(state.activePage).toBe("images");
  expect(state.activeNavText).toBe("图片");
});

test("defaults to light theme when no preference is stored", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const theme = await page.evaluate(() => document.documentElement.dataset.theme);

  expect(theme).toBe("light");
});

test("keeps desktop navigation visible on narrow desktop windows", async ({ page }) => {
  await page.setViewportSize({ width: 840, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const navigation = await page.evaluate(() => ({
    navDisplay: getComputedStyle(document.querySelector(".site-nav")).display,
    mobileToggleDisplay: getComputedStyle(document.querySelector(".mobile-menu-toggle")).display,
  }));

  expect(navigation.navDisplay).toBe("flex");
  expect(navigation.mobileToggleDisplay).toBe("none");
});

test("uses a single gallery column when the desktop content area is narrow", async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 900 });
  await page.goto("/?page=images", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".gallery-card");

  const gallery = await page.evaluate(() => {
    const list = document.querySelector(".mobile-image-list");
    const headerTitle = document.querySelector(".gallery-index-header h1");
    const columns = getComputedStyle(list).gridTemplateColumns
      .split(" ")
      .filter(Boolean);

    return {
      columnCount: columns.length,
      headerFontSize: Number.parseFloat(getComputedStyle(headerTitle).fontSize),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });

  expect(gallery.columnCount).toBe(1);
  expect(gallery.headerFontSize).toBeLessThanOrEqual(56);
  expect(gallery.scrollWidth).toBeLessThanOrEqual(gallery.innerWidth);
});

test("prioritizes visible gallery images and lazy-loads the rest", async ({ page }) => {
  await page.goto("/?page=images", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".gallery-card img");

  const loading = await page.evaluate(() =>
    [...document.querySelectorAll(".gallery-card img")]
      .slice(0, 5)
      .map((img) => img.getAttribute("loading")),
  );

  expect(loading.slice(0, 3)).toEqual(["eager", "eager", "eager"]);
  expect(loading[3]).toBe("lazy");
  expect(loading[4]).toBe("lazy");
});

test("uses remote R2 icons in the contact section", async ({ page }) => {
  await page.goto("/?page=contact", { waitUntil: "domcontentloaded" });

  const iconSources = await page.evaluate(() =>
    [...document.querySelectorAll(".contact-link img")].map((img) => img.src),
  );

  expect(iconSources).toHaveLength(6);
  for (const src of iconSources) {
    expect(src).toMatch(/^https:\/\/pub-03b5a2e995e948508262312977ad5792\.r2\.dev\/icons\/.+\.png$/);
  }
});

test("renders the detailed about profile and career timeline", async ({ page }) => {
  await page.goto("/?page=about", { waitUntil: "domcontentloaded" });

  const about = await page.evaluate(() => ({
    activePage: document.querySelector(".page-section.is-active")?.id,
    title: document.querySelector(".intro-title")?.textContent?.trim(),
    traitCount: document.querySelectorAll(".trait-card").length,
    timelineCount: document.querySelectorAll(".timeline-node").length,
    companyNames: [...document.querySelectorAll(".company-name")].map((node) => node.textContent?.trim()),
  }));

  expect(about.activePage).toBe("about");
  expect(about.title).toContain("你好，我是马聪");
  expect(about.traitCount).toBe(3);
  expect(about.timelineCount).toBe(3);
  expect(about.companyNames).toEqual([
    "经纬纺织机械股份新疆有限公司",
    "上海东方泵业有限公司",
    "新疆奥尼特自控设备有限公司",
  ]);

  await page.locator(".timeline-header").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(page.locator(".timeline-node.visible").first()).toBeVisible();
});
