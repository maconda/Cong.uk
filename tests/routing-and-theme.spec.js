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

test("navigation from an article detail opens the target list view", async ({ page }) => {
  await page.goto("/?page=articles&article=father", { waitUntil: "domcontentloaded" });

  await expect(page.locator("[data-article-detail]")).toBeVisible();

  await page.getByRole("link", { name: "分享" }).click();

  await expect(page).toHaveURL(/page=articles/);
  await expect(page).not.toHaveURL(/article=/);
  await expect(page.locator("[data-article-list]")).toBeVisible();
  await expect(page.locator("[data-article-detail]")).toBeHidden();

  await page.getByRole("button", { name: /在你离去的多年以后/ }).click();
  await expect(page.locator("[data-article-detail]")).toBeVisible();

  await page.getByRole("link", { name: "视频" }).click();

  await expect(page).toHaveURL(/page=videos/);
  await expect(page).not.toHaveURL(/article=/);
  await expect(page.locator("#videos")).toBeVisible();
});

test("defaults to light theme when no preference is stored", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const theme = await page.evaluate(() => document.documentElement.dataset.theme);

  expect(theme).toBe("light");
});

test("toggles between light and dark theme from the pull cord", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".theme-pull")).toBeVisible();
  await expect(page.locator(".theme-pull")).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(400);
  const lightBackground = await page.evaluate(() => ({
    color: getComputedStyle(document.body).color,
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    backgroundImage: getComputedStyle(document.body).backgroundImage,
  }));

  await page.locator(".theme-pull").click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".theme-pull")).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(400);
  const darkBackground = await page.evaluate(() => ({
    color: getComputedStyle(document.body).color,
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    backgroundImage: getComputedStyle(document.body).backgroundImage,
  }));
  expect(darkBackground).not.toEqual(lightBackground);
  expect(darkBackground.color).toBe("rgb(245, 245, 247)");

  await page.locator(".theme-pull").click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".theme-pull")).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(400);
  const restoredBackground = await page.evaluate(() => ({
    color: getComputedStyle(document.body).color,
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    backgroundImage: getComputedStyle(document.body).backgroundImage,
  }));
  expect(restoredBackground.color).toBe("rgb(42, 38, 34)");
  expect(restoredBackground.backgroundColor).toMatch(/rgb\(242, 239, 232\)|rgba\(242, 239, 232, 1\)/);
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

test("keeps the identity mark calm and well balanced", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const identity = await page.evaluate(() => {
    const link = document.querySelector(".identity");
    const name = document.querySelector(".identity__name");
    const slogan = document.querySelector(".identity__slogan");
    const linkStyle = getComputedStyle(link);
    const sloganRect = slogan.getBoundingClientRect();
    const sloganLineHeight = Number.parseFloat(getComputedStyle(slogan).lineHeight);

    return {
      display: linkStyle.display,
      flexDirection: linkStyle.flexDirection,
      alignItems: linkStyle.alignItems,
      backgroundColor: linkStyle.backgroundColor,
      borderWidth: linkStyle.borderTopWidth,
      boxShadow: linkStyle.boxShadow,
      transform: linkStyle.transform,
      nameFontSize: Number.parseFloat(getComputedStyle(name).fontSize),
      sloganWidth: sloganRect.width,
      sloganLineCount: Math.round(sloganRect.height / sloganLineHeight),
    };
  });

  expect(identity.display).toBe("flex");
  expect(identity.flexDirection).toBe("column");
  expect(identity.alignItems).toBe("flex-start");
  expect(identity.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(identity.borderWidth).toBe("0px");
  expect(identity.boxShadow).toBe("none");
  expect(identity.transform).toBe("none");
  expect(identity.nameFontSize).toBeGreaterThanOrEqual(30);
  expect(identity.sloganWidth).toBeLessThanOrEqual(180);
  expect(identity.sloganLineCount).toBeLessThanOrEqual(2);

  const box = await page.locator(".identity").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const pressedTransform = await page.locator(".identity").evaluate((node) => getComputedStyle(node).transform);
  await page.mouse.up();
  expect(pressedTransform).toBe("none");
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

test("hides the theme pull while the gallery viewer is open", async ({ page }) => {
  await page.goto("/?page=images", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".gallery-card__button");

  await page.locator(".gallery-card__button").first().click();
  await expect(page.locator(".gallery-viewer")).toHaveClass(/is-open/);

  const layering = await page.evaluate(() => {
    const pull = document.querySelector(".theme-pull");
    const viewer = document.querySelector(".gallery-viewer");
    const viewerRect = viewer.getBoundingClientRect();
    const topElement = document.elementFromPoint(viewerRect.right - 32, viewerRect.top + 32);
    const pullStyle = getComputedStyle(pull);

    return {
      pullDisplay: pullStyle.display,
      pullVisibility: pullStyle.visibility,
      pullOpacity: pullStyle.opacity,
      topClass: typeof topElement?.className === "string" ? topElement.className : "",
    };
  });

  expect(layering.pullDisplay).toBe("none");
  expect(layering.topClass).not.toContain("theme-pull");
});

test("opens a clean light gallery viewer with left photo and right metadata", async ({ page }) => {
  await page.goto("/?page=images", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".gallery-card__button");

  await page.locator(".gallery-card__button").first().click();
  await expect(page.locator(".gallery-viewer")).toHaveClass(/is-open/);
  await expect(page.locator(".gallery-viewer__figure img")).toBeVisible();

  const viewer = await page.evaluate(() => {
    const rail = document.querySelector(".gallery-viewer__rail");
    const rating = document.querySelector(".gallery-viewer__rating");
    const sidebar = document.querySelector(".sidebar");
    const siteNav = document.querySelector(".site-nav");
    const metadata = document.querySelector(".gallery-viewer__metadata");
    const figure = document.querySelector(".gallery-viewer__figure");
    const image = document.querySelector(".gallery-viewer__figure img");
    const toolbar = document.querySelector(".gallery-viewer__toolbar");
    const viewerNode = document.querySelector(".gallery-viewer");
    const metadataList = document.querySelector(".gallery-viewer__metadata dl");
    const fieldRows = [...document.querySelectorAll(".gallery-viewer__metadata dl > div")];
    const metadataRect = metadata.getBoundingClientRect();
    const metadataListRect = metadataList.getBoundingClientRect();
    const figureRect = figure.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    return {
      railDisplay: rail ? getComputedStyle(rail).display : null,
      ratingDisplay: rating ? getComputedStyle(rating).display : null,
      sidebarDisplay: sidebar ? getComputedStyle(sidebar).display : null,
      siteNavDisplay: siteNav ? getComputedStyle(siteNav).display : null,
      metadataLeft: metadataRect.left,
      metadataRight: metadataRect.right,
      metadataHeight: metadataRect.height,
      metadataBackground: getComputedStyle(metadata).backgroundImage,
      metadataBackgroundColor: getComputedStyle(metadata).backgroundColor,
      metadataCenterDelta: Math.abs(
        (metadataListRect.top + metadataListRect.height / 2) - (metadataRect.top + metadataRect.height / 2),
      ),
      figureLeft: figureRect.left,
      figureRight: figureRect.right,
      figureBackground: getComputedStyle(figure).backgroundImage,
      toolbarBackground: getComputedStyle(toolbar).backgroundImage,
      viewerBackgroundColor: getComputedStyle(viewerNode).backgroundColor,
      metadataTextColor: getComputedStyle(metadata).color,
      imageWidth: imageRect.width,
      imageHeight: imageRect.height,
      viewerText: document.querySelector(".gallery-viewer")?.textContent ?? "",
      visibleLabels: fieldRows
        .filter((row) => !row.hidden && getComputedStyle(row).display !== "none")
        .map((row) => row.querySelector("dt")?.textContent?.trim()),
      visibleValues: fieldRows
        .filter((row) => !row.hidden && getComputedStyle(row).display !== "none")
        .map((row) => row.querySelector("dd")?.textContent?.trim()),
    };
  });

  expect(viewer.railDisplay).toBe("none");
  expect([null, "none"]).toContain(viewer.ratingDisplay);
  expect(viewer.sidebarDisplay).toBe("none");
  expect(viewer.siteNavDisplay).toBe("none");
  expect(viewer.figureRight).toBeLessThanOrEqual(viewer.metadataLeft + 1);
  expect(viewer.figureLeft).toBeLessThan(viewer.metadataLeft);
  expect(viewer.metadataHeight).toBeGreaterThan(500);
  expect(viewer.figureRight - viewer.figureLeft).toBeGreaterThan(viewer.metadataRight - viewer.metadataLeft);
  expect(viewer.viewerBackgroundColor).toBe("rgb(242, 239, 232)");
  expect(viewer.metadataTextColor).toBe("rgb(42, 38, 34)");
  expect(viewer.metadataBackgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(viewer.metadataBackground).toBe("none");
  expect(viewer.metadataCenterDelta).toBeLessThan(32);
  expect(viewer.figureBackground).toBe("none");
  expect(viewer.toolbarBackground).toBe("none");
  expect(viewer.imageWidth).toBeGreaterThan(600);
  expect(viewer.imageHeight).toBeGreaterThan(300);
  for (const fakeLabel of ["精选", "最新", "随览", "附近", "远方", "发现", "评级", "★★★★☆"]) {
    expect(viewer.viewerText).not.toContain(fakeLabel);
  }
  expect(viewer.visibleLabels).toEqual(["名称", "画面", "尺寸", "地点", "相机"]);
  expect(viewer.visibleValues).not.toContain("未记录");
});

test("uses the dark gallery viewer only in dark theme", async ({ page }) => {
  await page.goto("/?page=images", { waitUntil: "domcontentloaded" });
  await page.locator(".theme-pull").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.locator(".gallery-card__button").first().click();
  await expect(page.locator(".gallery-viewer")).toHaveClass(/is-open/);

  const viewer = await page.evaluate(() => {
    const viewerNode = document.querySelector(".gallery-viewer");
    const metadata = document.querySelector(".gallery-viewer__metadata");
    return {
      background: getComputedStyle(viewerNode).backgroundColor,
      color: getComputedStyle(metadata).color,
    };
  });

  expect(viewer.background).toBe("rgb(16, 16, 15)");
  expect(viewer.color).toBe("rgba(255, 255, 255, 0.72)");
});

test("shows real extracted EXIF fields when a photo has them", async ({ page }) => {
  await page.goto("/?page=images", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".gallery-card__button");

  await page.locator(".gallery-card__button").nth(2).click();
  await expect(page.locator(".gallery-viewer")).toHaveClass(/is-open/);

  const fields = await page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll(".gallery-viewer__metadata dl > div")]
        .filter((row) => !row.hidden && getComputedStyle(row).display !== "none")
        .map((row) => [
          row.querySelector("dt")?.textContent?.trim(),
          row.querySelector("dd")?.textContent?.trim(),
        ]),
    ),
  );

  expect(fields["相机"]).toBe("SONY DSC-RX100M7");
  expect(fields["焦段"]).toBe("41mm / 113mm equiv.");
  expect(fields["光圈"]).toBe("f/4.5");
  expect(fields["快门"]).toBe("1/125s");
  expect(fields["ISO"]).toBe("ISO 400");
  expect(Object.values(fields)).not.toContain("未记录");
});

test("uses remote R2 icons in the contact section", async ({ page }) => {
  await page.goto("/?page=contact", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".contact-link img")].every((img) => img.naturalWidth > 0),
  );

  const icons = await page.evaluate(() =>
    [...document.querySelectorAll(".contact-link img")].map((img) => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
    })),
  );

  expect(icons).toHaveLength(6);
  for (const icon of icons) {
    expect(icon.src).toMatch(/^https:\/\/pub-03b5a2e995e948508262312977ad5792\.r2\.dev\/icons\/.+\.png$/);
    expect(icon.naturalWidth).toBeGreaterThan(0);
  }
});

test("renders contact links as a compact balanced icon matrix", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?page=contact", { waitUntil: "domcontentloaded" });

  const contactGrid = await page.evaluate(() => {
    const grid = document.querySelector(".contact-links");
    const firstLink = document.querySelector(".contact-link");
    const firstIcon = document.querySelector(".contact-link img");
    const linkStyle = getComputedStyle(firstLink);
    const iconStyle = getComputedStyle(firstIcon);
    const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean);

    return {
      columnCount: columns.length,
      labelCount: document.querySelectorAll(".contact-link__label").length,
      gridWidth: grid.getBoundingClientRect().width,
      gridHeight: grid.getBoundingClientRect().height,
      viewportWidth: window.innerWidth,
      linkHeight: firstLink.getBoundingClientRect().height,
      iconWidth: firstIcon.getBoundingClientRect().width,
      iconFilter: iconStyle.filter,
      linkBackground: linkStyle.backgroundColor,
      linkBorderWidth: linkStyle.borderTopWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });

  expect(contactGrid.columnCount).toBe(3);
  expect(contactGrid.labelCount).toBe(6);
  expect(contactGrid.gridWidth).toBeLessThanOrEqual(330);
  expect(contactGrid.gridHeight).toBeLessThanOrEqual(210);
  expect(contactGrid.linkHeight).toBeLessThanOrEqual(92);
  expect(contactGrid.iconWidth).toBe(44);
  expect(contactGrid.iconFilter).toContain("grayscale(1)");
  expect(contactGrid.linkBackground).toBe("rgba(0, 0, 0, 0)");
  expect(contactGrid.linkBorderWidth).toBe("0px");
  expect(contactGrid.scrollWidth).toBeLessThanOrEqual(contactGrid.viewportWidth);
});

test("keeps key text readable in dark mode", async ({ page }) => {
  await page.goto("/?page=contact", { waitUntil: "domcontentloaded" });
  await page.locator(".theme-pull").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.waitForTimeout(400);

  const colors = await page.evaluate(() => {
    const selectors = [
      ".site-nav a",
      ".page-section.is-active h1",
      ".contact-link__label",
    ];

    return selectors.map((selector) => {
      const node = document.querySelector(selector);
      const style = node ? getComputedStyle(node) : null;
      return {
        selector,
        color: style?.color,
        background: getComputedStyle(document.body).backgroundColor,
      };
    });
  });

  function luminance(color) {
    const match = color?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return 0;
    const [r, g, b] = match.slice(1, 4).map(Number).map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrast(foreground, background) {
    const fg = luminance(foreground);
    const bg = luminance(background);
    return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  }

  for (const sample of colors) {
    expect(contrast(sample.color, sample.background), sample.selector).toBeGreaterThanOrEqual(4.5);
  }
});

test("contact icons have no square card border", async ({ page }) => {
  await page.goto("/?page=contact", { waitUntil: "domcontentloaded" });

  const contact = await page.evaluate(() => {
    const firstLink = document.querySelector(".contact-link");
    const firstIcon = firstLink?.querySelector("img");
    const linkStyle = firstLink ? getComputedStyle(firstLink) : null;
    const iconStyle = firstIcon ? getComputedStyle(firstIcon) : null;

    return {
      linkBorderWidth: linkStyle?.borderTopWidth,
      iconBorderWidth: iconStyle?.borderTopWidth,
      linkBackground: linkStyle?.backgroundColor,
    };
  });

  expect(contact.linkBorderWidth).toBe("0px");
  expect(contact.iconBorderWidth).toBe("0px");
  expect(contact.linkBackground).toBe("rgba(0, 0, 0, 0)");
});

test("keeps the contact page inside the desktop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?page=contact", { waitUntil: "domcontentloaded" });

  const pageWidth = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.viewportWidth);
});

test("keeps section headers unframed and proportionate across viewport widths", async ({ page }) => {
  for (const width of [390, 760, 1440]) {
    await page.setViewportSize({ width, height: 900 });

    for (const pageName of ["images", "videos", "articles", "contact"]) {
      await page.goto(`/?page=${pageName}`, { waitUntil: "domcontentloaded" });
      if (pageName === "images") {
        await page.waitForSelector(".gallery-card");
      }

      const header = await page.evaluate(() => {
        const node = document.querySelector(".page-section.is-active .page-header, .page-section.is-active .gallery-index-header");
        const title = node?.querySelector("h1");
        const style = node ? getComputedStyle(node) : null;
        const titleStyle = title ? getComputedStyle(title) : null;

        return {
          borderBottomWidth: style?.borderBottomWidth,
          backgroundColor: style?.backgroundColor,
          boxShadow: style?.boxShadow,
          titleFontSize: titleStyle ? Number.parseFloat(titleStyle.fontSize) : 0,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        };
      });

      expect(header.borderBottomWidth).toBe("0px");
      expect(header.backgroundColor).toBe("rgba(0, 0, 0, 0)");
      expect(header.boxShadow).toBe("none");
      expect(header.titleFontSize).toBeLessThanOrEqual(width < 600 ? 44 : 64);
      expect(header.scrollWidth).toBeLessThanOrEqual(header.innerWidth);
    }
  }
});

test("uses the same soft paper texture on videos and articles", async ({ page }) => {
  for (const pageName of ["videos", "articles"]) {
    await page.goto(`/?page=${pageName}`, { waitUntil: "domcontentloaded" });

    const texture = await page.evaluate(() => ({
      bodyBackgroundImage: getComputedStyle(document.body).backgroundImage,
      beforeBackgroundImage: getComputedStyle(document.body, "::before").backgroundImage,
      headerBeforeDisplay: getComputedStyle(document.querySelector(".page-section.is-active .page-header"), "::before").display,
      headerAfterDisplay: getComputedStyle(document.querySelector(".page-section.is-active .page-header"), "::after").display,
      videoCardBeforeDisplay: document.querySelector(".page-section.is-active .video-card")
        ? getComputedStyle(document.querySelector(".page-section.is-active .video-card"), "::before").display
        : "none",
      videoCardBeforeBackground: document.querySelector(".page-section.is-active .video-card")
        ? getComputedStyle(document.querySelector(".page-section.is-active .video-card"), "::before").backgroundImage
        : "none",
    }));

    expect(texture.bodyBackgroundImage).not.toContain("repeating-linear-gradient");
    expect(texture.beforeBackgroundImage).toContain("data:image/svg+xml");
    expect(texture.headerBeforeDisplay).toBe("none");
    expect(texture.headerAfterDisplay).toBe("none");
    expect(texture.videoCardBeforeDisplay).toBe("none");
    expect(texture.videoCardBeforeBackground).not.toContain("repeating-linear-gradient");
  }
});

test("uses single-column content grids on phone widths", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const pageName of ["images", "videos"]) {
    await page.goto(`/?page=${pageName}`, { waitUntil: "domcontentloaded" });
    if (pageName === "images") {
      await page.waitForSelector(".gallery-card");
    }

    const columnCount = await page.evaluate(() => {
      const grid = document.querySelector(".page-section.is-active .mobile-image-list, .page-section.is-active .video-grid");
      return getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
    });

    expect(columnCount).toBe(1);
  }
});

test("renders the CV style about profile", async ({ page }) => {
  await page.goto("/?page=about", { waitUntil: "domcontentloaded" });

  const about = await page.evaluate(() => ({
    activePage: document.querySelector(".page-section.is-active")?.id,
    eyebrow: document.querySelector(".cv-eyebrow")?.textContent?.trim(),
    title: document.querySelector(".cv-name")?.textContent?.trim(),
    subtitle: document.querySelector(".cv-title")?.textContent?.trim(),
    highlightCount: document.querySelectorAll(".cv-highlight").length,
    timelineCount: document.querySelectorAll(".cv-timeline-item").length,
    skillColumnCount: document.querySelectorAll(".cv-skill-column").length,
    roles: [...document.querySelectorAll(".cv-role")].map((node) => node.textContent?.trim()),
    quote: document.querySelector(".cv-quote")?.textContent?.trim(),
  }));

  expect(about.activePage).toBe("about");
  expect(about.eyebrow).toBe("CURRICULUM VITAE / 2026");
  expect(about.title).toBe("马 聪");
  expect(about.subtitle).toContain("工业自控售前工程师");
  expect(about.highlightCount).toBe(3);
  expect(about.timelineCount).toBe(3);
  expect(about.skillColumnCount).toBe(3);
  expect(about.roles).toEqual([
    "工业自控售前工程师",
    "供应链跟单 / 大宗采购",
    "工程现场驻场工程师",
  ]);
  expect(about.quote).toBe("\"最漂亮的图纸,也必须在现场扎根。\"");
});

test("keeps the CV about page consistent and readable in both themes", async ({ page }) => {
  await page.goto("/?page=about", { waitUntil: "domcontentloaded" });

  async function sampleAboutTheme() {
    return page.evaluate(() => {
      function resolveColor(value) {
        const probe = document.createElement("span");
        probe.style.color = value;
        document.body.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      }

      const root = getComputedStyle(document.documentElement);
      const page = document.querySelector(".cv-page");
      const pageStyle = getComputedStyle(page);
      const selectors = [".cv-name", ".cv-title", ".cv-about p", ".cv-section-head h2", ".cv-body li", ".cv-footer"];

      return {
        theme: document.documentElement.dataset.theme,
        pageBackground: pageStyle.backgroundColor,
        expectedBackground: resolveColor(root.getPropertyValue("--page-bg").trim()),
        samples: selectors.map((selector) => {
          const node = document.querySelector(selector);
          return {
            selector,
            color: node ? getComputedStyle(node).color : null,
            background: pageStyle.backgroundColor,
          };
        }),
      };
    });
  }

  function luminance(color) {
    const match = color?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return 0;
    const [r, g, b] = match.slice(1, 4).map(Number).map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrast(foreground, background) {
    const fg = luminance(foreground);
    const bg = luminance(background);
    return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  }

  const light = await sampleAboutTheme();
  expect(light.theme).toBe("light");
  expect(light.pageBackground).toBe(light.expectedBackground);
  for (const sample of light.samples) {
    expect(contrast(sample.color, sample.background), `light ${sample.selector}`).toBeGreaterThanOrEqual(4.5);
  }

  await page.locator(".theme-pull").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  const dark = await sampleAboutTheme();
  expect(dark.pageBackground).toBe(dark.expectedBackground);
  for (const sample of dark.samples) {
    expect(contrast(sample.color, sample.background), `dark ${sample.selector}`).toBeGreaterThanOrEqual(4.5);
  }
});
