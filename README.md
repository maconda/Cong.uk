# Cong.uk

> 一个中文个人主页，集中展示摄影、视频、分享和联系方式。

**Cong.uk** 是我的个人网站。它不是产品官网，也不是博客模板，而是一个偏内容整理的主页：把图片、视频、分享摘录和联系入口放在同一个地方，方便持续更新，也方便别人快速了解我在做什么。

站点使用 [Vite](https://vitejs.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) + 原生 JavaScript 构建，重点是轻量、响应式和易维护。

## 内容

- **图片**：摄影作品索引，支持浏览和查看图片详情
- **视频**：Bilibili 和 YouTube 内容预览
- **分享**：杂志、新闻、链接摘录等碎片内容
- **关于**：个人经历、工作背景和兴趣说明
- **联系**：邮箱和社交平台入口

## 项目特点

- 中文为主的个人主页文案
- 图片托管在 Cloudflare R2
- 视频使用外部平台嵌入和跳转
- 适配桌面和移动端
- 支持浅色 / 深色主题切换
- 使用 Playwright 做页面回归测试

## 本地运行

```bash
npm ci
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`。

## 构建与预览

```bash
npm run build
npm run preview
```

## 图片自动同步

图片清单在 `public/photos.json`。页面会优先读取这个文件，所以以后新增 Cloudflare R2 图片时，只需要更新清单再构建。

手动添加几张图片：

```bash
npm run photos:merge -- --photos P11.jpg,P12.jpg
```

从 R2 桶自动读取 `photo/` 目录：

```bash
$env:CLOUDFLARE_ACCOUNT_ID="你的 account id"
$env:CLOUDFLARE_API_TOKEN="只读 R2 token"
$env:R2_BUCKET_NAME="你的 bucket 名"
npm run photos:merge -- --r2
```

同时让 OpenAI 按当前主页风格生成短标题和一句话介绍：

```bash
$env:OPENAI_API_KEY="你的 OpenAI key"
npm run photos:merge -- --r2 --ai
```

使用阿里云百炼 OpenAI 兼容接口时：

```bash
$env:OPENAI_API_KEY="你的阿里云百炼 API Key"
$env:OPENAI_BASE_URL="https://llm-dhaso9vsg1r04xf0.cn-beijing.maas.aliyuncs.com/compatible-mode/v1"
$env:OPENAI_MODEL="qwen-vl-plus"
npm run photos:merge -- --r2 --ai
```

脚本会保留已经手写过的标题和介绍，只给新增或空白的图片补文案。生成风格固定在 `scripts/photo-manifest.mjs` 的 `buildPhotoPrompt()`：朴素、短、有一点诗意，避免工具化和常见 AI 词。

## 部署

项目可直接部署到 Cloudflare Pages：

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: `20+`

## 说明

- 网站地址：<https://cong.uk>
- GitHub 仓库：<https://github.com/maconda/cong.uk>
- 说明文档：[`DESIGN.md`](./DESIGN.md)
- 贡献说明：[`CONTRIBUTING.md`](./CONTRIBUTING.md)

## 许可证

MIT
