import "./styles.css";

const pageSections = Array.from(document.querySelectorAll("[data-page]"));
const navLinks = Array.from(document.querySelectorAll(".site-nav a[href*='page=']"));
const aboutTimelineNodes = Array.from(document.querySelectorAll(".timeline-node"));
const themePull = document.querySelector(".theme-pull");
const cordPath = document.querySelector(".theme-pull__cord-path");
const defaultPage = "images";
const routePages = new Set(pageSections.map((section) => section.id));
const articleList = document.querySelector("[data-article-list]");
const articleDetail = document.querySelector("[data-article-detail]");
const articleSource = document.querySelector("[data-article-source]");
const articleTitle = document.querySelector("[data-article-title]");
const articleLead = document.querySelector("[data-article-lead]");
const articleBody = document.querySelector("[data-article-body]");
const articleOpenButtons = document.querySelectorAll("[data-article-open]");
const articleBackButton = document.querySelector("[data-article-back]");
let aboutTimelineObserver;
let aboutTimelineListenersBound = false;
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

function syncRoute(pageId, replace = false, { clearArticle = false } = {}) {
  if (!routePages.has(pageId)) return;

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("page", pageId);
  if (clearArticle) {
    nextUrl.searchParams.delete("article");
  }
  nextUrl.hash = "";
  window.history[replace ? "replaceState" : "pushState"]({}, "", `${nextUrl.pathname}?${nextUrl.searchParams.toString()}`);
}

const articles = {
  father: {
    source: "李健 / 转载整理",
    title: "在你离去的多年以后，我为你骄傲",
    lead: "这是一篇关于父亲、家庭、成长与迟到的理解的文字。它写到家信、离乡、清华时期的迷惘，也写到一个儿子在许多年后才真正理解父亲的隐忍与忠诚。",
    paragraphs: [
      "由于我之前从来没有离开过家，刚上大学时，很不适应一个人独立生活，总是不停地想家，而盼望家信，则成为我校园生活里一个不可或缺的内容。每天放学，就在传达室信件堆积如山的桌子上，寻找自己的名字。其实每封信的内容大致相同，而我总是不厌其烦地读了一遍又一遍。",
      "家信中，除了嘱咐我努力学习和注意身体外，就是告诉我别怕花钱。事实上，我从来不是一个在钱财上懂得计算的人，有时还愿意请客吃饭什么的，可每次自觉花钱多了的时候，也会深深自责。那时候每个人的家庭情况大都差不多，不会太富裕，尤其是我们家里有三个孩子，抚养的过程像是在爬上坡路一样，多少还是有些费力。",
      "三年级的时候，我开始厌学，心中竟隐约闪现了退学的念头，整天都郁郁寡欢。记得有一天，我在宿舍里整理书信时，翻看了大一时家里的来信，那来自父母的满篇的喜悦与自豪还有信誓旦旦让当时的我羞愧难当，一时竟泪流满面。心想，我不能为难善良的父母，不能打消他们在社会生活中刚刚建立的自信，更不能让我的家庭布满愁云。我暗暗下了决心，我一定要坚持到毕业，拿到学位。",
      "小的时候，我一直跟随父亲上班，他们排戏的时候我就在京剧团的院子里四处闲逛，陪伴我的是花花草草和蝴蝶蜻蜓，以及大把的时间。父亲是我见过的最老实善良的人，用当今的话说，就是完全无公害。几年后的一个寒冬，我常常在夜半醒来，发现父亲在写东西，有时还捂着胸口。我想，父亲在乎的不仅仅是几级工资的钱，还有一个演员对于职称的认可和艺术的尊重。",
      "初中毕业的时候我考上了市里面最好的高中。有一次父亲要随单位去俄罗斯演出，当天母亲让我去火车站送父亲。后来才知道，父亲是想在同事面前小小地炫耀一下他的儿子。那时我真正意识到他为我感到骄傲。而我也同时发现他有些老了，和从前的那个神采飞扬的武生父亲略有差别了。我的心隐隐地收紧了一下。",
      "我曾经写过一首歌叫《父亲》，里面写道：你为我骄傲，我却未曾因你感到自豪，你如此宽厚，是我永远的惭愧。去年我重新录制了这首歌，在最后加了一句：我终于明白在你离去的多年以后，我为你骄傲，当谈起你的时候……我知道了，我为他感到骄傲的，是他对生活的隐忍和对家庭的忠诚。",
      "现在，每当我取得什么成绩时，母亲在高兴之余常常会说，要是你爸还活着该有多好。前些天，她在看我的电视节目，当我唱完一首歌，她一个人对着电视机激动得鼓起了掌，还连声喊道：好好好。她把这些当作有趣的事情告诉了我，听后我也乐了，可随后心里却涌出一丝悲凉。是啊，要是父亲还活着该有多好，那鼓掌的就不是她一个人了，他们俩一定会热烈地讨论，我甚至可以想象他们谈话的内容。",
    ],
  },
  stand: {
    source: "《三联生活周刊》 / 李健",
    title: "立与不立皆辛苦",
    lead: "这篇文章写的是时间、梦想、三十而立与四十不惑这些被频繁引用却又常常被误解的话题。它不鼓吹成功，也不鼓吹失败，而是在讨论一个人如何与自己的处境达成和解。",
    paragraphs: [
      "多年以前，40岁对我来讲是个遥不可及的年龄，如今，我已不敢再怠慢时间了，因为它就像个刺客，不知何时会突然来到你的面前。是的，我已经被推进了40岁的门槛，而且，已经进来几年了。我在此并非要强调时间的速度，而是想说时间对于一个人的成长常常展现出苛刻甚至是吝啬的一面。",
      "我越来越感到做成一件事情所需的时间往往太多了，很多人在与时间的讨价还价中丧失了信心。一直以来，人们喜欢给人生标识刻度，以此来衡量每个人生的进程和质量。有人说，既然在当下的社会三十难立，那么就宽泛到四十吧。一个毫无背景的年轻人靠自己的努力想在30多岁找到属于自己的立足之地，有所成绩，谈何容易。",
      "我大学毕业后工作了三年，所从事的工作和专业没太大关系，跟后来的音乐工作更无关联。等到所谓的事业有所起色时我已经36岁了。回想在我30岁的时候，似乎刚刚找到音乐的方向，勉强能靠音乐为生，所谓成就无从谈起，面对谜一样的未来偶尔也会担心。",
      "通常，人们愿意用10年作为一个阶段，这看似不短的时间里，其实真正能用到做事的有效时间是很短的，不仅要花时间去找到一个方向，还要面临许多生活琐事。一个刚刚毕业的年轻人，在寻找自己未来的方向时，更多的是要解决自己的生活问题，这还不包括那些不可预知的精神烦恼。",
      "常听说，人要有梦想，那我们说说关于梦想的“梦话”。梦想可以有，但大部分梦想是实现不了的。即使实现不了那也没关系，我们依然可以活得很好，或者说，有些梦想实现不了更好，这意味着没有付出有可能是很沉重的代价。生活中，大多数人是平凡的，平凡没有什么不好，平凡自有它的幸运和乐趣。",
      "在别人眼中，我可能算是一个四十而立的代表，可这个“立”需要立多久以及能立多久呢？我不知道，没人知道。人的一生很不确定，很难在某一个阶段用某一个标准去评判。如果一定要去评判一个人的话，有时像评价爱情一样，只有到生命结束时才知道到底如何。",
      "最后，我想说的是，四十而立就不错了，三十能立更好，不“立”也没关系，因为这些“立”与“不立”都是别人眼里的，而你的世界理论上真的与他人无关。生命，就是时间之旅的体验，你可能没有世俗意义上的成功，但这并不妨碍你去寻找和积累生活的乐趣。",
    ],
  },
};

function revealVisibleAboutTimelineNodes() {
  if (!aboutTimelineNodes.length) return;

  aboutTimelineNodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      node.classList.add("visible");
    }
  });
}

function initAboutTimeline() {
  if (!aboutTimelineNodes.length) return;

  if (!aboutTimelineListenersBound) {
    window.addEventListener("scroll", revealVisibleAboutTimelineNodes, { passive: true });
    window.addEventListener("resize", revealVisibleAboutTimelineNodes);
    aboutTimelineListenersBound = true;
  }

  if (!("IntersectionObserver" in window)) {
    revealVisibleAboutTimelineNodes();
    return;
  }

  if (!aboutTimelineObserver) {
    aboutTimelineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.12 });

    aboutTimelineNodes.forEach((node) => aboutTimelineObserver.observe(node));
  }

  window.requestAnimationFrame(revealVisibleAboutTimelineNodes);
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

const VIDEO_API_URL = "https://bili-api.httpsaristinotionsitefoodie-57a2611a302c46ae86fc7f2d92a3a.workers.dev/";
const VIDEO_CACHE_KEY = "alano-video-cache-v1";
const VIDEO_FETCH_TIMEOUT_MS = 8000;
const BILIBILI_SPACE_URL = "https://space.bilibili.com/20221512";
const FALLBACK_VIDEO_RECORDS = [
  {
    bvid: "BV1dQ4y1a7J4",
    title: "暴躁“老哥”",
    pic: "http://i2.hdslb.com/bfs/archive/7dac1b5fd61e56b9aa416e201d7f1445560924a4.jpg",
  },
  {
    bvid: "BV1ri4y1971n",
    title: "想念没有疫情的日子",
    pic: "http://i1.hdslb.com/bfs/archive/4bf98c2953629725fbc15eff8e68fd545dcbc495.jpg",
  },
  {
    bvid: "BV1E34y197Gi",
    title: "别人的猫最好撸",
    pic: "http://i1.hdslb.com/bfs/archive/c42834468a3ba0e8bc6b4852f4aa19cb4d9871cb.jpg",
  },
  {
    bvid: "BV1sL4y1a7Be",
    title: "累了",
    pic: "http://i2.hdslb.com/bfs/archive/d840503ee8d478439138511be1750f2128d6cf18.jpg",
  },
  {
    bvid: "BV1TL411t75z",
    title: "The Circle Comes Full Circle",
    pic: "http://i1.hdslb.com/bfs/archive/f6030362fd6f965b2bc815d2cb2ac52527b80868.jpg",
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

function getRequestedArticle() {
  const url = new URL(window.location.href);
  const articleId = url.searchParams.get("article");
  return articleId && articles[articleId] ? articleId : "";
}

function setArticleRoute(articleId, replace = false) {
  const nextUrl = new URL(window.location.href);
  if (articleId) {
    nextUrl.searchParams.set("article", articleId);
  } else {
    nextUrl.searchParams.delete("article");
  }
  window.history[replace ? "replaceState" : "pushState"]({}, "", `${nextUrl.pathname}?${nextUrl.searchParams.toString()}`);
}

function renderArticleDetail(articleId) {
  const article = articles[articleId];
  if (!articleDetail || !articleList || !article || !articleSource || !articleTitle || !articleLead || !articleBody) {
    return;
  }

  articleList.hidden = true;
  articleDetail.hidden = false;
  articleSource.textContent = article.source;
  articleTitle.textContent = article.title;
  articleLead.textContent = article.lead;
  articleBody.innerHTML = article.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
}

function showArticleList() {
  if (!articleDetail || !articleList) return;
  articleList.hidden = false;
  articleDetail.hidden = true;
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
    link.classList.toggle("active", isActive);
  });

  if (activePageId === "images") {
    updateFrameSize();
  }

  if (activePageId === "about") {
    initAboutTimeline();
  }

  if (activePageId === "articles") {
    const articleId = getRequestedArticle();
    if (articleId) {
      renderArticleDetail(articleId);
    } else {
      showArticleList();
    }
  }
}

const videoGrid = document.querySelector("[data-video-grid]");
const videoLoadingState = document.querySelector("[data-video-loading-state]");
const videoErrorState = document.querySelector("[data-video-error-state]");
const videoModal = document.querySelector("[data-video-modal]");
const videoModalFrame = document.querySelector("[data-video-modal-frame]");
const videoModalCloseButtons = document.querySelectorAll("[data-video-modal-close]");
let dynamicVideos = [];
let activeVideoBvid = "";

function normalizeVideoRecord(video) {
  const thumbnail = video.pic
    ? (video.pic.startsWith("http") ? video.pic.replace(/^http:/, "https:") : `https:${video.pic}`)
    : "";
  return {
    platform: "Bilibili",
    title: video.title || "未命名视频",
    duration: video.duration || "",
    bvid: video.bvid,
    watchUrl: `https://www.bilibili.com/video/${video.bvid}/`,
    embedUrl: `https://player.bilibili.com/player.html?bvid=${video.bvid}&page=1&autoplay=1&high_quality=1&as_wide=1`,
    thumbnail,
  };
}

function getFallbackVideos() {
  return FALLBACK_VIDEO_RECORDS.map(normalizeVideoRecord);
}

function getCachedVideos() {
  try {
    const cached = JSON.parse(localStorage.getItem(VIDEO_CACHE_KEY) || "[]");
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
}

function cacheVideos(videos) {
  try {
    localStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify(videos));
  } catch {
    // Cache write can fail in private mode; the video list still renders.
  }
}

async function fetchVideosWithTimeout() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), VIDEO_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(VIDEO_API_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("video api failed");
    }
    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

function closeVideoModal() {
  if (!videoModal || !videoModalFrame) return;
  videoModal.hidden = true;
  videoModalFrame.innerHTML = "";
}

function openVideoModal(bvid) {
  const video = dynamicVideos.find((item) => item.bvid === bvid);
  if (!videoModal || !videoModalFrame || !video) return;

  videoModalFrame.innerHTML = `<iframe src="${video.embedUrl}" title="${video.title}" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  videoModal.hidden = false;
}

function renderVideoGrid(videos) {
  if (!videoGrid) return;

  videoGrid.innerHTML = "";
  dynamicVideos = videos;

  videos.forEach((video, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "video-card";
    card.setAttribute("aria-label", `播放${video.title}`);
    card.addEventListener("click", () => openVideoModal(video.bvid));
    if (index === 0) {
      activeVideoBvid = video.bvid;
    }

    card.innerHTML = `
      <span class="video-card__media video-media">
        ${index === 0 ? '<span class="video-card__badge">最新</span>' : ""}
        <img src="${video.thumbnail}" alt="${video.title}视频封面" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.video-card__media')?.classList.add('is-missing-image'); this.remove();">
        <span class="video-media__fallback" aria-hidden="true"></span>
      </span>
      <span class="video-card__body">
        <span class="video-meta">
          <span class="video-pill">${video.platform}</span>
        </span>
        <strong>${video.title}</strong>
      </span>
    `;

    videoGrid.appendChild(card);
  });
}

async function loadDynamicVideos() {
  if (!videoGrid) return;

  const cachedVideos = getCachedVideos();
  if (cachedVideos.length) {
    renderVideoGrid(cachedVideos);
    if (videoLoadingState) {
      videoLoadingState.hidden = true;
    }
  } else {
    renderVideoGrid(getFallbackVideos());
    if (videoLoadingState) {
      videoLoadingState.hidden = true;
    }
  }

  try {
    const payload = await fetchVideosWithTimeout();
    const videos = Array.isArray(payload)
      ? payload.filter((video) => video?.bvid && video?.pic).map(normalizeVideoRecord)
      : [];

    if (!videos.length) {
      throw new Error("empty video payload");
    }

    cacheVideos(videos);
    renderVideoGrid(videos);

    if (videoLoadingState) {
      videoLoadingState.hidden = true;
    }

    if (videoErrorState) {
      videoErrorState.hidden = true;
    }
  } catch (error) {
    if (videoLoadingState) {
      videoLoadingState.hidden = true;
    }

    if (videoErrorState && !cachedVideos.length && !videoGrid.children.length) {
      videoErrorState.hidden = false;
      videoErrorState.innerHTML = `视频接口暂时不可用。可以先前往 <a href="${BILIBILI_SPACE_URL}" target="_blank" rel="noopener noreferrer">Bilibili 主页</a> 查看。`;
    }
  }
}

videoModalCloseButtons.forEach((button) => button.addEventListener("click", closeVideoModal));

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && videoModal && !videoModal.hidden) {
    closeVideoModal();
  }
});

loadDynamicVideos();

const images = [
  {
    src: "https://img.cong.uk/photo/P1.JPG",
    title: "楼间窄巷",
    description: "楼缝里有一小段光，人走过去，下午也跟着轻了一下。",
    location: "城市巷道",
    camera: "Apple iPhone 8",
  },
  {
    src: "https://img.cong.uk/photo/P2.jpg",
    title: "雨中的街铺",
    description: "雨没有停，店里的灯还亮着，路上的人都低着头往前走。",
    location: "雨中街口",
    camera: "Apple iPhone 8",
  },
  {
    src: "https://img.cong.uk/photo/P3.JPG",
    title: "远处的田线",
    description: "地很空，远处几条线慢慢躺开，人站在那里，显得很轻。",
    location: "田野远景",
    camera: "SONY DSC-RX100M7",
    focalLength: "41mm / 113mm equiv.",
    aperture: "f/4.5",
    shutter: "1/125s",
    iso: "ISO 400",
  },
  {
    src: "https://img.cong.uk/photo/P4.JPG",
    title: "楼下人群",
    description: "楼下的人等着，说着，散着，日子就在车道边停了一会儿。",
    location: "街楼之间",
    camera: "SONY DSC-RX100M7",
    focalLength: "9mm / 24mm equiv.",
    aperture: "f/3.5",
    shutter: "1/125s",
    iso: "ISO 100",
  },
  {
    src: "https://img.cong.uk/photo/P5.JPG",
    title: "广场边缘",
    description: "人群往各处走，只有这个侧影停住，像替我留住一秒。",
    location: "城市广场",
    camera: "SONY DSC-RX100M7",
    focalLength: "50mm / 135mm equiv.",
    aperture: "f/4.5",
    shutter: "1/125s",
    iso: "ISO 800",
  },
  {
    src: "https://img.cong.uk/photo/P6.jpg",
    title: "海边栈道",
    description: "木道通向海边，风从前面吹来，话就留在了身后。",
    location: "海岸步道",
  },
  {
    src: "https://img.cong.uk/photo/P7.jpg",
    title: "夜色水岸",
    description: "水边的灯亮得安静，两个人靠着，像把夜晚坐短了一点。",
    location: "夜晚水岸",
  },
  {
    src: "https://img.cong.uk/photo/P8.jpg",
    title: "街巷人流",
    description: "窄巷贴着招牌，人从中间穿过去，谁也没有打扰谁。",
    location: "街巷",
  },
  {
    src: "https://img.cong.uk/photo/P9.jpg",
    title: "街边回望",
    description: "她回头看了一眼，街灯和行人都安静下来。",
    location: "街边",
    camera: "SONY DSC-RX100M7",
    focalLength: "10mm / 26mm equiv.",
    aperture: "f/3.2",
    shutter: "1/30s",
    iso: "ISO 250",
  },
  {
    src: "https://img.cong.uk/photo/P10.jpg",
    title: "小店室内",
    description: "桌椅收好了，灯落在木头上，像刚有人起身离开。",
    location: "室内小店",
    camera: "SONY ILCE-7RM2",
    lens: "FE 24mm F1.4 GM",
    focalLength: "24mm / 24mm equiv.",
    aperture: "f/2",
    shutter: "1/160s",
    iso: "ISO 2000",
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
const viewerFocalLength = document.querySelector("[data-viewer-focal-length]");
const viewerAperture = document.querySelector("[data-viewer-aperture]");
const viewerShutter = document.querySelector("[data-viewer-shutter]");
const viewerIso = document.querySelector("[data-viewer-iso]");
const viewerCloseButtons = document.querySelectorAll("[data-viewer-close]");
const viewerPrevious = document.querySelector("[data-viewer-previous]");
const viewerNext = document.querySelector("[data-viewer-next]");
let activeViewerIndex = 0;

function setViewerField(node, value) {
  if (!node) return;

  const row = node.closest("div");
  const hasValue = typeof value === "string" ? value.trim().length > 0 : Boolean(value);

  if (row) row.hidden = !hasValue;
  if (hasValue) node.textContent = value;
}

function updateViewerSize() {
  if (!viewerImage || !viewerSize) return;

  const row = viewerSize.closest("div");
  if (row) row.hidden = false;

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
  setViewerField(viewerTitle, activeItem.title);
  setViewerField(viewerDescription, activeItem.description);
  setViewerField(viewerLocation, activeItem.location);
  setViewerField(viewerCamera, activeItem.camera);
  setViewerField(viewerLens, activeItem.lens);
  setViewerField(viewerFocalLength, activeItem.focalLength);
  setViewerField(viewerAperture, activeItem.aperture);
  setViewerField(viewerShutter, activeItem.shutter);
  setViewerField(viewerIso, activeItem.iso);
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

    syncRoute(pageId, false, { clearArticle: true });
    updatePageVisibility();
  });
});

articleOpenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const articleId = button.dataset.articleOpen;
    if (!articleId || !articles[articleId]) return;
    setArticleRoute(articleId);
    renderArticleDetail(articleId);
  });
});

articleBackButton?.addEventListener("click", () => {
  setArticleRoute("");
  showArticleList();
});

window.addEventListener("popstate", updatePageVisibility);
updatePageVisibility();
