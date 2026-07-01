import test from "node:test";
import assert from "node:assert/strict";

import {
  mergePhotoRecords,
  buildPhotoPrompt,
  buildR2ObjectsUrl,
  buildChatCompletionsUrl,
  generateCaption,
  isMainModule,
  listR2PhotoKeys,
  normalizePhotoUrl,
} from "../scripts/photo-manifest.mjs";

test("normalizes R2 photo paths into public photo URLs", () => {
  assert.equal(
    normalizePhotoUrl("P11.jpg"),
    "https://pub-87e925c7796a4e538d6501e03f59add6.r2.dev/photo/P11.jpg",
  );
  assert.equal(
    normalizePhotoUrl("https://example.com/photo/P12.jpg"),
    "https://example.com/photo/P12.jpg",
  );
});

test("merges new R2 photos while preserving existing handmade captions", () => {
  const existing = [
    {
      src: "https://pub-87e925c7796a4e538d6501e03f59add6.r2.dev/photo/P1.JPG",
      title: "楼间窄巷",
      description: "楼缝里有一小段光，人走过去，下午也跟着轻了一下。",
    },
  ];

  const merged = mergePhotoRecords(existing, ["P1.JPG", "P11.jpg"]);

  assert.equal(merged.length, 2);
  assert.equal(merged[0].title, "楼间窄巷");
  assert.equal(merged[0].description, "楼缝里有一小段光，人走过去，下午也跟着轻了一下。");
  assert.equal(merged[1].src, "https://pub-87e925c7796a4e538d6501e03f59add6.r2.dev/photo/P11.jpg");
  assert.equal(merged[1].title, "");
  assert.equal(merged[1].description, "");
});

test("builds a caption prompt with the required plain poetic style", () => {
  const prompt = buildPhotoPrompt("https://pub-87e925c7796a4e538d6501e03f59add6.r2.dev/photo/P11.jpg");

  assert.match(prompt, /朴素/);
  assert.match(prompt, /不要像 AI/);
  assert.match(prompt, /title/);
  assert.match(prompt, /description/);
  assert.match(prompt, /P11\.jpg/);
});

test("builds Cloudflare R2 object-list URLs with prefix and cursor", () => {
  const url = buildR2ObjectsUrl({
    accountId: "abc123",
    bucketName: "cong-assets",
    prefix: "photo/",
    cursor: "next-page",
  });

  assert.equal(url.origin, "https://api.cloudflare.com");
  assert.equal(url.pathname, "/client/v4/accounts/abc123/r2/buckets/cong-assets/objects");
  assert.equal(url.searchParams.get("prefix"), "photo/");
  assert.equal(url.searchParams.get("cursor"), "next-page");
  assert.equal(url.searchParams.get("per_page"), "1000");
});

test("lists R2 photo keys across pages and ignores non-image objects", async () => {
  const requestedUrls = [];
  const fakeFetch = async (url) => {
    requestedUrls.push(String(url));
    const isSecondPage = String(url).includes("cursor=page-2");
    return {
      ok: true,
      async json() {
        return isSecondPage
          ? {
              success: true,
              result: [
                { key: "photo/P12.PNG" },
                { key: "photo/readme.txt" },
              ],
              result_info: { is_truncated: false },
            }
          : {
              success: true,
              result: [
                { key: "photo/P11.jpg" },
                { key: "video/new.mp4" },
              ],
              result_info: { is_truncated: true, cursor: "page-2" },
            };
      },
    };
  };

  const keys = await listR2PhotoKeys({
    accountId: "abc123",
    apiToken: "token",
    bucketName: "cong-assets",
    prefix: "photo/",
    fetchImpl: fakeFetch,
  });

  assert.deepEqual(keys, ["P11.jpg", "P12.PNG"]);
  assert.equal(requestedUrls.length, 2);
});

test("detects direct CLI execution from Windows paths with Chinese characters", () => {
  assert.equal(
    isMainModule(
      "file:///C:/Users/Sugar/OneDrive/%E6%96%87%E6%A1%A3/app/scripts/photo-manifest.mjs",
      "C:\\Users\\Sugar\\OneDrive\\文档\\app\\scripts\\photo-manifest.mjs",
    ),
    true,
  );
});

test("builds chat completions URLs for OpenAI-compatible Aliyun endpoints", () => {
  const url = buildChatCompletionsUrl(
    "https://llm-dhaso9vsg1r04xf0.cn-beijing.maas.aliyuncs.com/compatible-mode/v1",
  );

  assert.equal(
    url.href,
    "https://llm-dhaso9vsg1r04xf0.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions",
  );
});

test("generates captions through OpenAI-compatible chat completions endpoints", async () => {
  let requestUrl = "";
  let requestBody = null;
  const fakeFetch = async (url, options) => {
    requestUrl = String(url);
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      async json() {
        return {
          choices: [
            {
              message: {
                content: "{\"title\":\"窗边小雨\",\"description\":\"雨贴在窗上，屋里的人把声音放轻了。\",\"location\":\"窗边\"}",
              },
            },
          ],
        };
      },
    };
  };

  const caption = await generateCaption(
    { src: "https://pub-87e925c7796a4e538d6501e03f59add6.r2.dev/photo/P11.jpg" },
    {
      apiKey: "test-key",
      model: "qwen-vl-plus",
      aiBaseUrl: "https://llm-dhaso9vsg1r04xf0.cn-beijing.maas.aliyuncs.com/compatible-mode/v1",
      fetchImpl: fakeFetch,
    },
  );

  assert.equal(
    requestUrl,
    "https://llm-dhaso9vsg1r04xf0.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions",
  );
  assert.equal(requestBody.model, "qwen-vl-plus");
  assert.equal(requestBody.messages[0].content[0].type, "text");
  assert.equal(requestBody.messages[0].content[1].type, "image_url");
  assert.equal(requestBody.messages[0].content[1].image_url.url, "https://pub-87e925c7796a4e538d6501e03f59add6.r2.dev/photo/P11.jpg");
  assert.equal(caption.title, "窗边小雨");
  assert.equal(caption.description, "雨贴在窗上，屋里的人把声音放轻了。");
});
