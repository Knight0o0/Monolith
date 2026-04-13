/* ──────────────────────────────────────────────
   独立页面管理工具 (Pages)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

export function registerPageTools(server: McpServer) {
  // ── 列出所有独立页 ──
  server.tool(
    "list_pages",
    "列出所有独立页面（含未发布），返回标题、slug、状态、排序等",
    {},
    async () => {
      const pages = await apiRequest("/api/admin/pages");
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(pages, null, 2),
        }],
      };
    }
  );

  // ── 获取单个独立页 ──
  server.tool(
    "get_page",
    "获取指定 slug 的独立页面完整内容",
    { slug: z.string().describe("页面 slug") },
    async ({ slug }) => {
      const page = await apiRequest(`/api/admin/pages/${encodeURIComponent(slug)}`);
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(page, null, 2),
        }],
      };
    }
  );

  // ── 创建/更新独立页 ──
  server.tool(
    "upsert_page",
    "创建或更新一个独立页面（如关于页、友链页等）",
    {
      slug: z.string().describe("页面 slug"),
      title: z.string().describe("页面标题"),
      content: z.string().describe("Markdown 正文"),
      status: z.enum(["published", "draft"]).default("draft").describe("发布状态"),
      showInNav: z.boolean().default(false).describe("是否在导航栏显示"),
      sortOrder: z.number().default(0).describe("导航排序"),
    },
    async (params) => {
      const result = await apiRequest("/api/admin/pages", {
        method: "POST",
        body: params,
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 独立页 "${params.slug}" 已保存：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );

  // ── 删除独立页 ──
  server.tool(
    "delete_page",
    "⚠️ 【高危操作】永久删除指定的独立页面，此操作不可逆！",
    { 
      slug: z.string().describe("要删除的页面 slug"),
      confirm: z.enum(["yes"]).describe("必须输入 'yes' 确认高危操作")
    },
    async ({ slug, confirm }) => {
      if (confirm !== "yes") {
        return { content: [{ type: "text" as const, text: "❌ 操作已取消：未确认高危操作。" }], isError: true };
      }
      const result = await apiRequest("/api/admin/pages/delete", {
        method: "POST",
        body: { slug },
      });
      return {
        content: [{
          type: "text" as const,
          text: `🗑️ 独立页 "${slug}" 已删除。${JSON.stringify(result)}`,
        }],
      };
    }
  );
}
