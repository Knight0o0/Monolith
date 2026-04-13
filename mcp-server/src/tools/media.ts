/* ──────────────────────────────────────────────
   媒体管理工具 (Media)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

export function registerMediaTools(server: McpServer) {
  // ── 列出媒体库 ──
  server.tool(
    "list_media",
    "列出对象存储（R2/S3）中的所有媒体文件，包含文件名、大小、上传时间和 URL",
    {
      page: z.number().default(1).describe("页码"),
      limit: z.number().default(50).describe("每页数量"),
    },
    async ({ page, limit }) => {
      const media = await apiRequest("/api/admin/media", {
        query: { page, limit },
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(media, null, 2),
        }],
      };
    }
  );

  // ── 上传媒体（base64） ──
  server.tool(
    "upload_media",
    "上传文件到对象存储。由于 MCP 限制，需将文件内容以 base64 编码传入。适合上传小型图片或文本文件。",
    {
      filename: z.string().describe("文件名，如 photo.jpg"),
      base64Content: z.string().describe("文件内容的 base64 编码"),
      contentType: z.string().default("application/octet-stream").describe("MIME 类型"),
    },
    async ({ filename, base64Content, contentType }) => {
      // 将 base64 转为二进制并通过 multipart 上传
      const { apiUrl, password: _ } = getConfigForUpload();
      const token = await getTokenForUpload();

      const buffer = Buffer.from(base64Content, "base64");
      const blob = new Blob([buffer], { type: contentType });

      const formData = new FormData();
      formData.append("file", blob, filename);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 媒体上传 30s 超时

      try {
        const res = await fetch(`${apiUrl}/api/admin/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorText = await res.text();
          return {
            content: [{
              type: "text" as const,
              text: `❌ 上传失败 (${res.status}): ${errorText}`,
            }],
            isError: true,
          };
        }

        const result = await res.json();
        return {
          content: [{
            type: "text" as const,
            text: `✅ 文件 "${filename}" 上传成功：${JSON.stringify(result, null, 2)}`,
          }],
        };
      } catch (err: any) {
        if (err.name === "AbortError") {
          return { content: [{ type: "text" as const, text: "❌ 上传超时 (30s)" }], isError: true };
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    }
  );

  // ── 删除媒体 ──
  server.tool(
    "delete_media",
    "⚠️ 【高危操作】删除对象存储中的指定文件，此操作不可逆！",
    { 
      key: z.string().describe("文件的存储 Key（路径）"),
      confirm: z.enum(["yes"]).describe("必须输入 'yes' 确认高危操作")
    },
    async ({ key, confirm }) => {
      if (confirm !== "yes") {
        return { content: [{ type: "text" as const, text: "❌ 操作已取消：未确认高危操作。" }], isError: true };
      }
      const result = await apiRequest(`/api/admin/media/${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      return {
        content: [{
          type: "text" as const,
          text: `🗑️ 媒体文件 "${key}" 已删除。${JSON.stringify(result)}`,
        }],
      };
    }
  );
}

// ── 上传专用：需要直接访问 config 和 token ──
function getConfigForUpload() {
  const apiUrl = process.env.MONOLITH_API_URL?.replace(/\/$/, "") || "";
  const password = process.env.MONOLITH_PASSWORD || "";
  return { apiUrl, password };
}

let _uploadToken: string | null = null;
let _uploadTokenExp = 0;

async function getTokenForUpload(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (_uploadToken && now < _uploadTokenExp) return _uploadToken;

  const { apiUrl, password } = getConfigForUpload();
  const res = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = (await res.json()) as { token: string };
  _uploadToken = data.token;
  _uploadTokenExp = now + 7 * 24 * 3600 - 3600;
  return _uploadToken;
}
