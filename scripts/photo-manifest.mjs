import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const PHOTO_BASE_URL = "https://pub-87e925c7796a4e538d6501e03f59add6.r2.dev/photo";
const DEFAULT_MANIFEST = "public/photos.json";
const IMAGE_FILE_RE = /\.(avif|gif|jpe?g|png|webp)$/i;

export function normalizePhotoUrl(value, baseUrl = PHOTO_BASE_URL) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl.replace(/\/$/, "")}/${value.replace(/^\/+/, "")}`;
}

function photoKey(src) {
  return decodeURIComponent(src.split("/").pop() || src).toLowerCase();
}

export function mergePhotoRecords(existingRecords, photoPaths, baseUrl = PHOTO_BASE_URL) {
  const existingByKey = new Map(existingRecords.map((record) => [photoKey(record.src), record]));
  const orderedKeys = new Set();
  const merged = [];

  for (const item of photoPaths) {
    const src = normalizePhotoUrl(item, baseUrl);
    const key = photoKey(src);
    orderedKeys.add(key);
    merged.push(existingByKey.get(key) || {
      src,
      title: "",
      description: "",
      location: "",
    });
  }

  for (const record of existingRecords) {
    const key = photoKey(record.src);
    if (!orderedKeys.has(key)) merged.push(record);
  }

  return merged;
}

export function buildPhotoPrompt(imageUrl) {
  return [
    "你在为一个中文个人摄影主页写图片标题和一句话介绍。",
    "风格要求：朴素、短、有一点诗意，像个人记录，不要像 AI，不要工具化。",
    "禁止使用：氛围感、治愈、光影交错、时光、静谧、定格、美好瞬间。",
    "标题 2 到 6 个汉字；介绍一句话，18 到 32 个汉字。",
    "只返回 JSON：{\"title\":\"\",\"description\":\"\",\"location\":\"\"}",
    `图片地址：${imageUrl}`,
  ].join("\n");
}

export function buildR2ObjectsUrl({ accountId, bucketName, prefix = "", cursor = "" }) {
  const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects`);
  url.searchParams.set("per_page", "1000");
  if (prefix) url.searchParams.set("prefix", prefix);
  if (cursor) url.searchParams.set("cursor", cursor);
  return url;
}

function normalizeR2ResultItems(payload) {
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.result?.objects)) return payload.result.objects;
  return [];
}

function getR2NextCursor(payload) {
  const info = payload?.result_info || payload?.result?.result_info || {};
  if (info.cursor) return info.cursor;
  if (info.is_truncated && info.next_cursor) return info.next_cursor;
  return "";
}

export async function listR2PhotoKeys({
  accountId,
  apiToken,
  bucketName,
  prefix = "photo/",
  fetchImpl = fetch,
}) {
  if (!accountId) throw new Error("Cloudflare account id is required for --r2");
  if (!apiToken) throw new Error("Cloudflare API token is required for --r2");
  if (!bucketName) throw new Error("Cloudflare R2 bucket name is required for --r2");

  const keys = [];
  let cursor = "";

  do {
    const response = await fetchImpl(buildR2ObjectsUrl({ accountId, bucketName, prefix, cursor }), {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    if (!response.ok) {
      throw new Error(`Cloudflare R2 list request failed: ${response.status} ${await response.text()}`);
    }

    const payload = await response.json();
    if (payload.success === false) {
      const message = payload.errors?.map((error) => error.message).filter(Boolean).join("; ");
      throw new Error(`Cloudflare R2 list request failed: ${message || "unknown error"}`);
    }

    for (const item of normalizeR2ResultItems(payload)) {
      const key = item.key || item.name;
      if (!key || !IMAGE_FILE_RE.test(key)) continue;
      keys.push(prefix && key.startsWith(prefix) ? key.slice(prefix.length) : key);
    }

    cursor = getR2NextCursor(payload);
  } while (cursor);

  return keys;
}

async function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJsonFile(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function parseArgs(argv) {
  const args = {
    manifest: DEFAULT_MANIFEST,
    baseUrl: PHOTO_BASE_URL,
    photos: [],
    ai: false,
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    r2: false,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    apiToken: process.env.CLOUDFLARE_API_TOKEN || "",
    bucketName: process.env.R2_BUCKET_NAME || "",
    prefix: process.env.R2_PHOTO_PREFIX || "photo/",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--manifest") args.manifest = argv[++index];
    else if (arg === "--base-url") args.baseUrl = argv[++index];
    else if (arg === "--photos") args.photos = argv[++index].split(",").map((item) => item.trim()).filter(Boolean);
    else if (arg === "--photos-file") args.photos.push(...(awaitableReadList(argv[++index])));
    else if (arg === "--ai") args.ai = true;
    else if (arg === "--model") args.model = argv[++index];
    else if (arg === "--r2") args.r2 = true;
    else if (arg === "--account-id") args.accountId = argv[++index];
    else if (arg === "--api-token") args.apiToken = argv[++index];
    else if (arg === "--bucket") args.bucketName = argv[++index];
    else if (arg === "--prefix") args.prefix = argv[++index];
    else args.photos.push(arg);
  }

  return args;
}

function awaitableReadList(filePath) {
  return fs.readFile(filePath, "utf8")
    .then((content) => content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
}

async function resolvePhotoInputs(rawPhotos) {
  const resolved = [];
  for (const item of rawPhotos) {
    if (item && typeof item.then === "function") resolved.push(...await item);
    else resolved.push(item);
  }
  return resolved;
}

async function generateCaptionWithOpenAI(record, model) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for --ai");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: buildPhotoPrompt(record.src) },
            { type: "input_image", image_url: record.src },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "photo_caption",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              location: { type: "string" },
            },
            required: ["title", "description", "location"],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI caption request failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const text = payload.output_text
    || payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
  if (!text) throw new Error("OpenAI response did not include output text");
  return JSON.parse(text);
}

export function isMainModule(importMetaUrl, argvEntry = process.argv[1]) {
  return importMetaUrl === pathToFileURL(argvEntry).href;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const r2Inputs = args.r2
    ? await listR2PhotoKeys({
        accountId: args.accountId,
        apiToken: args.apiToken,
        bucketName: args.bucketName,
        prefix: args.prefix,
      })
    : [];
  const photoInputs = [...await resolvePhotoInputs(args.photos), ...r2Inputs];
  if (!photoInputs.length) {
    throw new Error("Provide photo filenames/URLs with --photos, --photos-file, or positional arguments.");
  }

  const manifestPath = path.resolve(args.manifest);
  const existing = await readJsonFile(manifestPath, []);
  const merged = mergePhotoRecords(existing, photoInputs, args.baseUrl);

  if (args.ai) {
    for (const record of merged) {
      if (record.title && record.description) continue;
      const caption = await generateCaptionWithOpenAI(record, args.model);
      record.title = caption.title;
      record.description = caption.description;
      record.location = caption.location || record.location || "";
    }
  }

  await writeJsonFile(manifestPath, merged);
  console.log(`Wrote ${merged.length} photo records to ${manifestPath}`);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
