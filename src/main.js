import "./styles.css";

const pageSections = Array.from(document.querySelectorAll("[data-page]"));
const navLinks = Array.from(document.querySelectorAll(".site-nav a[href*='page=']"));
const themePull = document.querySelector(".theme-pull");
const cordPath = document.querySelector(".theme-pull__cord-path");
const defaultPage = "images";
const routePages = new Set(pageSections.map((section) => section.id));
let cordKickStartedAt = 0;
let cordPullTimeout;
let cordPointerX = 0;
let cordPointerY = 0.5;
let cordPointerStrength = 0;
let cordHandleY = 0;
let cordHandleScale = 1;

function getCurrentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function updateThemeControl() {
  if (!themePull) return;

  const isDark = getCurrentTheme() === "dark";
  themePull.setAttribute("aria-pressed", String(isDark));
  themePull.setAttribute("aria-label", isDark ? "切换到白色模式" : "切换到暗夜模式");
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("site-theme", theme);
  updateThemeControl();
}

themePull?.addEventListener("click", () => {
  const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
  cordKickStartedAt = performance.now();
  window.clearTimeout(cordPullTimeout);
  themePull.classList.remove("is-pulled");
  window.requestAnimationFrame(() => themePull.classList.add("is-pulled"));
  cordPullTimeout = window.setTimeout(() => themePull.classList.remove("is-pulled"), 720);
  setTheme(nextTheme);
});

themePull?.addEventListener("animationend", (event) => {
  if (event.animationName === "cord-pull") {
    themePull.classList.remove("is-pulled");
  }
});

updateThemeControl();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function syncRoute(pageId, replace = false) {
  if (!routePages.has(pageId)) return;

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("page", pageId);
  nextUrl.hash = "";
  window.history[replace ? "replaceState" : "pushState"]({}, "", `${nextUrl.pathname}?${nextUrl.searchParams.toString()}`);
}

window.addEventListener("pointermove", (event) => {
  if (!themePull || !cordPath) return;

  const rect = themePull.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const localX = event.clientX - centerX;
  const localY = event.clientY - rect.top;
  const distanceX = Math.abs(localX);
  const distanceY = Math.abs(localY - rect.height * 0.46);
  const horizontalPull = Math.max(0, 1 - distanceX / 120);
  const verticalPull = Math.max(0, 1 - distanceY / 105);
  const nextStrength = horizontalPull * verticalPull;

  cordPointerX = clamp(localX / 72, -1, 1);
  cordPointerY = clamp(localY / rect.height, 0, 1);
  cordPointerStrength = Math.max(cordPointerStrength, nextStrength);
});

function getCordPath(time) {
  const seconds = time / 1000;
  const kickAge = cordKickStartedAt ? (time - cordKickStartedAt) / 1000 : 99;
  const kick = Math.max(0, Math.exp(-kickAge * 3.6) * Math.sin(kickAge * 30));
  const shiverPulse = Math.max(0, Math.sin(seconds * 1.15 + 0.4)) ** 3;
  const shiver = (Math.sin(seconds * 22.5) * 0.58 + Math.sin(seconds * 31) * 0.28) * shiverPulse;
  const idle = Math.sin(seconds * 2.2) * 3.2 + Math.sin(seconds * 3.7 + 1.2) * 1.15 + shiver;
  const pointerFalloff = (point) => Math.exp(-((point - cordPointerY) ** 2) / 0.09);
  const pointerForce = cordPointerX * cordPointerStrength * 11;
  const amplitude = idle + kick * 7.5;
  const idleStretch = Math.sin(seconds * 2.05 - 0.6) * 5.2 + Math.sin(seconds * 4.1) * 1.3 + shiver * 0.7;
  const stretch = idleStretch + Math.abs(kick) * 6.5;
  const phase = seconds * 4.4;
  const topX = 22;
  const x1 = topX + Math.sin(phase + 0.4) * amplitude * 0.28 + pointerForce * pointerFalloff(0.22);
  const x2 = topX + Math.sin(phase + 1.45) * amplitude + pointerForce * pointerFalloff(0.5);
  const x3 = topX + Math.sin(phase + 2.8) * amplitude * 0.72 + pointerForce * pointerFalloff(0.78);
  const y2 = 35 + stretch * 0.28;
  const y4 = 72 + stretch * 0.72;
  cordHandleY = 1 + stretch * 0.68;
  cordHandleScale = 1 - Math.min(0.045, Math.abs(kick) * 0.035);

  return [
    `M ${topX} 0`,
    `C ${x1.toFixed(2)} ${(15 + stretch * 0.08).toFixed(2)}, ${x2.toFixed(2)} ${(25 + stretch * 0.16).toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`,
    `S ${x3.toFixed(2)} ${(56 + stretch * 0.5).toFixed(2)}, ${topX} ${y4.toFixed(2)}`,
  ].join(" ");
}

function animateCord(time) {
  if (cordPath) {
    cordPath.setAttribute("d", getCordPath(time));
  }

  if (themePull) {
    themePull.style.setProperty("--cord-handle-y", `${cordHandleY.toFixed(2)}px`);
    themePull.style.setProperty("--cord-handle-scale", cordHandleScale.toFixed(3));
  }

  cordPointerStrength *= 0.9;
  window.requestAnimationFrame(animateCord);
}

if (cordPath && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.requestAnimationFrame(animateCord);
}

const videos = [
  {
    platform: "Bilibili",
    title: "暴躁“老哥”",
    description: "嵌入播放来自哔哩哔哩，本站仅作为视频预览与索引。",
    duration: "00:27",
    watchUrl: "https://www.bilibili.com/video/BV1dQ4y1a7J4/",
    embedUrl: "https://player.bilibili.com/player.html?bvid=BV1dQ4y1a7J4&cid=462590117&page=1&autoplay=0",
    allow: "fullscreen; picture-in-picture",
    thumbnail: "https://i2.hdslb.com/bfs/archive/7dac1b5fd61e56b9aa416e201d7f1445560924a4.jpg",
  },
  {
    platform: "YouTube",
    title: "YouTube 视频",
    description: "嵌入播放来自 YouTube，本站仅作为视频预览与索引。",
    duration: "",
    watchUrl: "https://youtu.be/qWasfMjE7SA",
    embedUrl: "https://www.youtube.com/embed/qWasfMjE7SA?rel=0",
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    thumbnail: "https://img.youtube.com/vi/qWasfMjE7SA/hqdefault.jpg",
  },
];

function getRequestedPage() {
  const url = new URL(window.location.href);
  const queryPage = url.searchParams.get("page");

  if (routePages.has(queryPage)) {
    return queryPage;
  }

  const hashPage = window.location.hash.replace("#", "");
  if (routePages.has(hashPage)) {
    return hashPage;
  }

  return defaultPage;
}

function updatePageVisibility() {
  const activePageId = getRequestedPage();
  syncRoute(activePageId, true);

  pageSections.forEach((section) => {
    const isActive = section.id === activePageId;
    section.hidden = !isActive;
    section.classList.toggle("is-active", isActive);
  });

  navLinks.forEach((link) => {
    const linkPage = new URL(link.href, window.location.href).searchParams.get("page");
    const isActive = linkPage === activePageId;
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (activePageId === "images") {
    updateFrameSize();
  }
}

const videoFrame = document.querySelector(".video-player-frame iframe");
const videoPlatform = document.querySelector(".video-platform");
const videoTitle = document.querySelector(".video-title");
const videoDescription = document.querySelector(".video-description");
const videoOpenLink = document.querySelector(".video-open-link");
const videoCards = Array.from(document.querySelectorAll(".video-card"));

function showVideo(index) {
  const video = videos[index];
  if (!video) return;

  if (videoFrame) {
    videoFrame.src = video.embedUrl;
    videoFrame.title = video.title;
    videoFrame.allow = video.allow;
  }

  if (videoPlatform) {
    videoPlatform.textContent = video.platform;
  }

  if (videoTitle) {
    videoTitle.textContent = video.title;
  }

  if (videoDescription) {
    videoDescription.textContent = video.description;
  }

  if (videoOpenLink) {
    videoOpenLink.href = video.watchUrl;
    videoOpenLink.textContent = `在 ${video.platform} 打开`;
  }

  videoCards.forEach((card, cardIndex) => {
    const isActive = cardIndex === index;
    card.classList.toggle("is-active", isActive);
    if (isActive) {
      card.setAttribute("aria-current", "true");
    } else {
      card.removeAttribute("aria-current");
    }
  });
}

videoCards.forEach((card) => {
  card.addEventListener("click", () => {
    const index = Number(card.dataset.videoIndex);
    showVideo(index);
  });
});

const images = [
  {
    src: "https://img.cong.uk/photo/P1.JPG",
    title: "楼间窄巷",
    description: "午后从楼上望下去，有人穿过窄窄的夹缝，像一句没说完的话。",
    location: "城市巷道",
  },
  {
    src: "https://img.cong.uk/photo/P2.jpg",
    title: "雨中的街铺",
    description: "雨把招牌和车灯揉在一起，街边的小店还亮着，路人各自赶路。",
    location: "雨中街口",
  },
  {
    src: "https://img.cong.uk/photo/P3.JPG",
    title: "远处的田线",
    description: "风从空地上过去，人小得像点，远处的线条慢慢铺开。",
    location: "田野远景",
  },
  {
    src: "https://img.cong.uk/photo/P4.JPG",
    title: "楼下人群",
    description: "楼下有人等车，有人说话，城市在玻璃和车道之间短暂停住。",
    location: "街楼之间",
  },
  {
    src: "https://img.cong.uk/photo/P5.JPG",
    title: "广场边缘",
    description: "人群从身边散开，一个侧影停在前面，像刚好错过的片刻。",
    location: "城市广场",
  },
  {
    src: "https://img.cong.uk/photo/P6.jpg",
    title: "海边栈道",
    description: "木道一直往海边走，风很大，人的声音被留在身后。",
    location: "海岸步道",
  },
  {
    src: "https://img.cong.uk/photo/P7.jpg",
    title: "夜色水岸",
    description: "夜里的水岸很亮，两个人靠在一起，像在等一阵风过去。",
    location: "夜晚水岸",
  },
  {
    src: "https://img.cong.uk/photo/P8.jpg",
    title: "街巷人流",
    description: "巷子不宽，招牌贴得很近，人从镜头前后慢慢走过去。",
    location: "街巷",
  },
  {
    src: "https://img.cong.uk/photo/P9.jpg",
    title: "街边回望",
    description: "她回头的一瞬间，后面的街灯和行人都退成了背景。",
    location: "街边",
  },
  {
    src: "https://img.cong.uk/photo/P10.jpg",
    title: "小店室内",
    description: "桌椅收拾得很安静，灯光落在木头上，像有人刚刚离开。",
    location: "室内小店",
  },
];

let currentIndex = 0;
const image = document.querySelector(".gallery-frame img");
const imagePrevious = document.querySelector(".gallery-image-hit--previous");
const imageNext = document.querySelector(".gallery-image-hit--next");
const imageCursor = document.querySelector(".image-cursor");
const imageWrap = document.querySelector(".gallery-image-wrap");
const mobileImageList = document.querySelector(".mobile-image-list");

function populateMobileImages() {
  if (!mobileImageList || mobileImageList.children.length) return;

  images.forEach((item, index) => {
    const card = document.createElement("figure");
    const button = document.createElement("button");
    const mobileImage = document.createElement("img");
    const caption = document.createElement("figcaption");
    const title = document.createElement("strong");
    const description = document.createElement("span");

    card.className = "gallery-card";
    button.className = "gallery-card__button";
    button.type = "button";
    button.setAttribute("aria-label", `查看${item.title}`);
    button.addEventListener("click", () => openGalleryViewer(index));
    mobileImage.className = "gallery-card__image";
    mobileImage.src = item.src;
    mobileImage.alt = item.title;
    mobileImage.loading = index < 3 ? "eager" : "lazy";
    if (index < 3) {
      mobileImage.fetchPriority = "high";
    }
    mobileImage.decoding = "async";
    mobileImage.addEventListener("load", () => {
      mobileImage.classList.add("is-loaded");
      button.classList.add("is-image-loaded");
    }, { once: true });
    if (mobileImage.complete && mobileImage.naturalWidth) {
      mobileImage.classList.add("is-loaded");
      button.classList.add("is-image-loaded");
    }
    caption.className = "gallery-card__meta";
    title.className = "gallery-card__title";
    title.textContent = item.title;
    description.className = "gallery-card__description";
    description.textContent = item.description;

    caption.append(title, description);
    button.append(mobileImage);
    card.append(button, caption);
    mobileImageList.appendChild(card);
  });
}

const galleryViewer = document.querySelector(".gallery-viewer");
const viewerImage = document.querySelector(".gallery-viewer__figure img");
const viewerTitle = document.querySelector("[data-viewer-title]");
const viewerDescription = document.querySelector("[data-viewer-description]");
const viewerSize = document.querySelector("[data-viewer-size]");
const viewerLocation = document.querySelector("[data-viewer-location]");
const viewerCamera = document.querySelector("[data-viewer-camera]");
const viewerLens = document.querySelector("[data-viewer-lens]");
const viewerCloseButtons = document.querySelectorAll("[data-viewer-close]");
const viewerPrevious = document.querySelector("[data-viewer-previous]");
const viewerNext = document.querySelector("[data-viewer-next]");
let activeViewerIndex = 0;

function updateViewerSize() {
  if (!viewerImage || !viewerSize) return;

  if (viewerImage.naturalWidth && viewerImage.naturalHeight) {
    viewerSize.textContent = `${viewerImage.naturalWidth} × ${viewerImage.naturalHeight}`;
  } else {
    viewerSize.textContent = "读取中";
  }
}

function showViewerImage(index) {
  if (!galleryViewer || !viewerImage) return;

  activeViewerIndex = (index + images.length) % images.length;
  const activeItem = images[activeViewerIndex];
  viewerImage.src = activeItem.src;
  viewerImage.alt = activeItem.title;
  if (viewerTitle) viewerTitle.textContent = activeItem.title;
  if (viewerDescription) viewerDescription.textContent = activeItem.description;
  if (viewerLocation) viewerLocation.textContent = activeItem.location || "未记录";
  if (viewerCamera) viewerCamera.textContent = activeItem.camera || "未记录";
  if (viewerLens) viewerLens.textContent = activeItem.lens || "未记录";
  updateViewerSize();
}

function openGalleryViewer(index) {
  if (!galleryViewer) return;

  showViewerImage(index);
  galleryViewer.classList.add("is-open");
  galleryViewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("viewer-open");
}

function closeGalleryViewer() {
  if (!galleryViewer) return;

  galleryViewer.classList.remove("is-open");
  galleryViewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("viewer-open");
}

viewerImage?.addEventListener("load", updateViewerSize);
viewerCloseButtons.forEach((button) => button.addEventListener("click", closeGalleryViewer));
viewerPrevious?.addEventListener("click", () => showViewerImage(activeViewerIndex - 1));
viewerNext?.addEventListener("click", () => showViewerImage(activeViewerIndex + 1));

window.addEventListener("keydown", (event) => {
  if (!galleryViewer?.classList.contains("is-open")) return;

  if (event.key === "Escape") closeGalleryViewer();
  if (event.key === "ArrowLeft") showViewerImage(activeViewerIndex - 1);
  if (event.key === "ArrowRight") showViewerImage(activeViewerIndex + 1);
});

function showImage(index) {
  if (!image) return;

  currentIndex = (index + images.length) % images.length;
  image.classList.add("is-fading");

  window.setTimeout(() => {
    image.src = images[currentIndex].src;
    image.alt = images[currentIndex].title;
  }, 360);
}

function updateFrameSize() {
  if (!image || !imageWrap || !image.naturalWidth || !image.naturalHeight) return;

  const text = document.querySelector(".gallery-text");
  const availableWidth = Math.min(1000, Math.max(240, window.innerWidth - 340));
  const availableHeight = Math.max(240, window.innerHeight - 120);
  const scale = Math.min(1, availableWidth / image.naturalWidth, availableHeight / image.naturalHeight);
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);

  image.style.width = `${width}px`;
  image.style.height = `${height}px`;
  imageWrap.style.width = `${width}px`;
  imageWrap.style.height = `${height}px`;

  if (text) {
    text.style.width = `${width}px`;
  }
}

populateMobileImages();

imagePrevious?.addEventListener("click", () => showImage(currentIndex - 1));
imageNext?.addEventListener("click", () => showImage(currentIndex + 1));

imageWrap?.addEventListener("mousemove", (event) => {
  if (!imageCursor || !imageWrap) return;

  const rect = imageWrap.getBoundingClientRect();
  const isPreviousSide = event.clientX < rect.left + rect.width / 2;
  imageCursor.textContent = isPreviousSide ? "←" : "→";
  imageCursor.style.left = `${event.clientX}px`;
  imageCursor.style.top = `${event.clientY}px`;
});

image?.addEventListener("load", () => {
  updateFrameSize();
  window.requestAnimationFrame(() => image.classList.remove("is-fading"));
});

window.addEventListener("resize", updateFrameSize);

if (image?.complete) {
  updateFrameSize();
}

document.querySelectorAll(".mobile-menu-toggle").forEach((toggle) => {
  const sidebar = toggle.closest(".sidebar");
  if (!sidebar) return;

  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const pageId = new URL(link.href, window.location.href).searchParams.get("page");
    if (!routePages.has(pageId)) return;

    syncRoute(pageId);
    updatePageVisibility();
  });
});

window.addEventListener("popstate", updatePageVisibility);
updatePageVisibility();
