import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import DOMPurify from "dompurify";


// 按需注册语言（避免打包过大）
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import python from "highlight.js/lib/languages/python";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";
import diff from "highlight.js/lib/languages/diff";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);
hljs.registerLanguage("diff", diff);

// 配置 marked
const renderer = new marked.Renderer();

// 标题：注入 id 属性（用于 TOC 锚点）
function slugify(text: string): string {
  // 循环去除 HTML 标签（防止多字符序列截断后残留，如 <scr<script>ipt>）
  let cleaned = text;
  let prev = "";
  while (prev !== cleaned) {
    prev = cleaned;
    cleaned = cleaned.replace(/<[^>]*>/g, "");
  }
  return cleaned
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, "") // 保留中文、字母、数字、空格、连字符
    .replace(/\s+/g, "-")          // 空格转连字符
    .replace(/-+/g, "-")           // 合并连续连字符
    .replace(/^-|-$/g, "");        // 去除首尾连字符
}

renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = slugify(text);
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

// 代码块：高亮 + 语言标签 + 复制按钮
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : "";
  const highlighted = language
    ? hljs.highlight(text, { language }).value
    : escapeHtml(text);
  const langLabel = language ? `<span class="code-lang">${language}</span>` : "";
  
  const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
  const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400"><path d="M20 6 9 17l-5-5"/></svg>`;

  return `<div class="code-block-wrapper relative group">
    <button class="copy-code-btn absolute top-2 right-2 flex items-center justify-center p-1.5 rounded-md border border-border/40 bg-card/60 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-card hover:border-border/80 opacity-40 hover:opacity-100 group-hover:opacity-100 z-10" aria-label="复制代码">
      ${copyIcon}
    </button>
    <pre class="hljs">${langLabel}<code class="hljs language-${language || "text"}">${highlighted}</code></pre>
  </div>`;
};

// 图片/视频：懒加载 + 圆角 + 视频解析
renderer.image = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
  
  // 1. 直链视频支持
  if (href.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return `<figure class="md-figure md-video">
      <video src="${href}" controls playsinline preload="metadata" class="w-full rounded-lg border border-border/20 shadow-lg bg-black/5"></video>
      ${text ? `<figcaption>${escapeHtml(text)}</figcaption>` : ""}
    </figure>`;
  }

  // 2. 哔哩哔哩 (Bilibili) 视频支持解析
  const bpxMatch = href.match(/bilibili\.com\/video\/([a-zA-Z0-9]+)/i);
  if (bpxMatch) {
    const bvid = bpxMatch[1];
    return `<figure class="md-figure md-video">
      <div class="relative w-full aspect-video rounded-lg overflow-hidden border border-border/20 shadow-lg">
        <iframe src="//player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" class="absolute inset-0 w-full h-full"></iframe>
      </div>
      ${text ? `<figcaption>${escapeHtml(text)}</figcaption>` : ""}
    </figure>`;
  }

  // 3. YouTube 视频支持解析
  const ytMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    const ytid = ytMatch[1];
    return `<figure class="md-figure md-video">
      <div class="relative w-full aspect-video rounded-lg overflow-hidden border border-border/20 shadow-lg">
        <iframe src="https://www.youtube.com/embed/${ytid}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="absolute inset-0 w-full h-full"></iframe>
      </div>
      ${text ? `<figcaption>${escapeHtml(text)}</figcaption>` : ""}
    </figure>`;
  }

  // 默认图片渲染
  return `<figure class="md-figure"><img src="${href}" alt="${escapeHtml(text)}" loading="lazy" decoding="async"${titleAttr}/>${text ? `<figcaption>${escapeHtml(text)}</figcaption>` : ""}</figure>`;
};

// 表格：响应式包裹
renderer.table = (token: any) => {
  const header = token.header || '';
  const body = token.body || token.rows || '';
  return `<div class="table-wrapper"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
};

// 链接：外部链接自动 target="_blank"
renderer.link = (token: any) => {
  const href = token.href || '';
  const title = token.title || '';
  const text = token.text || '';
  const isExternal = href.startsWith("http");
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
  const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a href="${href}"${titleAttr}${externalAttrs}>${text}</a>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
});

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * 渲染 Markdown 为 HTML（已通过 DOMPurify 净化，防 XSS）
 * 支持：标题/粗体/斜体/删除线/链接/图片/代码块(高亮)/行内代码/
 *       表格/任务列表/有序无序列表/引用/分隔线/脚注
 */
export function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  // 净化 HTML，允许 iframe（B站/YouTube 嵌入）和代码块复制按钮所需的 data 属性
  return DOMPurify.sanitize(raw, {
    ADD_TAGS: ["iframe", "video", "source", "figure", "figcaption"],
    ADD_ATTR: [
      "allow", "allowfullscreen", "frameborder", "scrolling",
      "playsinline", "preload", "controls",
      "loading", "decoding",
      "target", "rel",
    ],
  });
}


/* ── TOC 辅助函数 ─────────────────────────── */

export type TocHeading = {
  id: string;
  text: string;
  level: number;
};

/**
 * 从 Markdown 源文本中提取标题列表（h2-h4）
 * 用于生成 Table of Contents
 */
export function extractHeadings(md: string): TocHeading[] {
  const headings: TocHeading[] = [];
  // 匹配 Markdown 标题语法：## ~ ####
  const regex = /^(#{2,4})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(md)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();
    // 去除 Markdown 行内格式（粗体、斜体、代码等）
    const plainText = rawText
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1");
    headings.push({
      id: slugify(plainText),
      text: plainText,
      level,
    });
  }
  return headings;
}
