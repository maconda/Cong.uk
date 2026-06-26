import { test, expect } from "@playwright/test";

test("normalizes hash routes without scrolling", async ({ page }) => {
  await page.goto("/#images", { waitUntil: "networkidle" });

  await expect(page).toHaveURL(/page=images/);

  const state = await page.evaluate(() => ({
    scrollY: window.scrollY,
    activePage: document.querySelector(".page-section.is-active")?.id,
  }));

  expect(state.scrollY).toBe(0);
  expect(state.activePage).toBe("images");
});

test("defaults to light theme when no preference is stored", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/", { waitUntil: "networkidle" });

  const theme = await page.evaluate(() => document.documentElement.dataset.theme);

  expect(theme).toBe("light");
});

test("keeps desktop navigation visible on narrow desktop windows", async ({ page }) => {
  await page.setViewportSize({ width: 840, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const navigation = await page.evaluate(() => ({
    navDisplay: getComputedStyle(document.querySelector(".site-nav")).display,
    mobileToggleDisplay: getComputedStyle(document.querySelector(".mobile-menu-toggle")).display,
  }));

  expect(navigation.navDisplay).toBe("flex");
  expect(navigation.mobileToggleDisplay).toBe("none");
});
