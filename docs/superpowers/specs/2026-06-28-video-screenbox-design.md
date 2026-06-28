# Video Screenbox Design

**Date:** 2026-06-28

**Goal**

将当前站点的 `videos` 页面整体替换为基于 Cloudflare Worker 动态拉取的 Screenbox 风格视频模块，支持响应式卡片列表、站内弹窗播放、加载失败提示，并保持与现有单页路由结构兼容。

## Scope

- 替换 [index.html](C:\Users\Sugar\OneDrive\Desktop\cong.uk\index.html) 中现有整个 `videos` 页面内容。
- 将用户提供的新模块结构整合为项目现有的 HTML + CSS + JS 组织方式。
- 使用既有 Cloudflare Worker 接口动态加载视频数据。
- 点击视频卡片后在站内弹窗内嵌播放 Bilibili 视频。
- 关闭弹窗时销毁 `iframe`，避免音频残留。
- 保留当前站点导航、页面切换和整体外壳结构。

## Out Of Scope

- 不修改图片、分享、关于、联系页面。
- 不引入新的构建工具、框架或第三方前端库。
- 不改动远端 Worker 接口逻辑。

## Architecture

实现保持当前 Vite 单页静态站点结构：

- `index.html` 只保留视频栏目所需的语义化挂载结构。
- `src/styles.css` 承载所有 Screenbox 模块样式，避免内联样式。
- `src/main.js` 承载视频数据请求、卡片渲染、弹窗打开关闭和事件绑定逻辑，避免内联 `onclick`。

## Video Page Structure

视频页替换后包含以下结构：

1. 页面标题与简短引导文案。
2. `screenbox-root` 容器。
3. `screenbox-video-grid` 作为动态视频卡片挂载点。
4. 初始加载文案。
5. `screenbox-modal` 弹窗。
6. `sb-player-container` 作为 16:9 播放器容器。
7. `sbIframeWrapper` 作为 `iframe` 注入点。

## Data Flow

1. 页面初始化时执行视频模块初始化函数。
2. 函数请求：
   `https://bili-api.httpsaristinotionsitefoodie-57a2611a302c46ae86fc7f2d92a3a.workers.dev/`
3. 成功时读取数组项中的 `title`、`bvid`、`pic` 字段。
4. 生成视频卡片并插入网格。
5. 点击卡片时拼接 Bilibili player `iframe` 地址并打开弹窗。
6. 关闭弹窗时清空 `sbIframeWrapper`。

## Interaction Rules

- 加载中显示“正在初始化媒体中继流...”。
- 请求失败时显示明确错误文案。
- 卡片 hover 需要有位移、边框高亮和阴影反馈。
- 缩略图保持 16:9 比例并支持轻微放大。
- 弹窗点击遮罩关闭，点击播放器容器本身不关闭。
- 关闭按钮始终可见可点。

## Styling Rules

- 视觉语言以用户提供的暗色、磨砂、蓝色高亮方案为准。
- 样式命名以 `screenbox-` 和 `sb-` 为前缀，避免污染现有类名。
- 响应式网格使用 `repeat(auto-fill, minmax(280px, 1fr))`。
- 播放器容器最大宽度 960px，比例 16:9。

## Error Handling

- `fetch` 非 2xx 或 JSON 解析失败时显示失败文案。
- 接口返回空数组时显示空状态提示。
- 缩略图地址若不是绝对 URL，则自动补全为 `https:`.

## Testing And Verification

- 运行构建命令验证项目可编译：
  `npm run build`
- 启动本地预览验证视频页可访问：
  `npm run preview -- --host 127.0.0.1 --port 4173`
- 打开 `?page=videos`，确认：
  - 视频列表加载成功或失败态可见
  - 点击卡片可打开弹窗
  - 关闭弹窗后播放器被销毁

## Files To Modify

- [index.html](C:\Users\Sugar\OneDrive\Desktop\cong.uk\index.html)
- [src/styles.css](C:\Users\Sugar\OneDrive\Desktop\cong.uk\src\styles.css)
- [src/main.js](C:\Users\Sugar\OneDrive\Desktop\cong.uk\src\main.js)

## Acceptance Criteria

- `videos` 页面已不再显示旧的精选视频和旧卡片布局。
- 新视频模块从 Worker 动态拉取并渲染。
- 视频卡片点击后在站内弹窗播放。
- 本地构建通过。
- 本地预览中 `?page=videos` 可正常浏览。
