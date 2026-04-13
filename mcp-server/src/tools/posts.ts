/* ──────────────────────────────────────────────
   文章管理工具 (Posts)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

export function registerPostTools(server: McpServer) {
  // ── 列出所有文章（含草稿）──
  server.tool(
    "list_posts",
    "列出博客所有文章（含草稿与定时发布），返回标题、slug、状态、标签、浏览量等信息",
    {},
    async () => {
      const posts = await apiRequest<unknown[]>("/api/admin/posts");
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(posts, null, 2),
        }],
      };
    }
  );

  // ── 获取单篇文章 ──
  server.tool(
    "get_post",
    "获取指定 slug 的文章完整内容（含 Markdown 正文、元信息）",
    { slug: z.string().describe("文章的 URL 标识符 (slug)") },
    async ({ slug }) => {
      const post = await apiRequest(`/api/posts/${encodeURIComponent(slug)}`, { auth: false });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(post, null, 2),
        }],
      };
    }
  );

  // ── 搜索文章 ──
  server.tool(
    "search_posts",
    "根据关键词搜索文章标题和内容",
    { query: z.string().describe("搜索关键词") },
    async ({ query }) => {
      const results = await apiRequest("/api/search", {
        auth: false,
        query: { q: query },
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(results, null, 2),
        }],
      };
    }
  );

  // ── 创建文章 ──
  server.tool(
    "create_post",
    "创建一篇新文章。需提供 title、slug、content（Markdown），可选 tags、category、status 等",
    {
      title: z.string().describe("文章标题"),
      slug: z.string().describe("URL 标识符，如 my-first-post"),
      content: z.string().describe("Markdown 格式的文章正文"),
      excerpt: z.string().optional().describe("文章摘要"),
      coverImage: z.string().optional().describe("封面图 URL"),
      status: z.enum(["published", "draft", "scheduled"]).default("draft").describe("发布状态"),
      tags: z.array(z.string()).default([]).describe("标签列表"),
      category: z.string().optional().describe("分类名称"),
      series: z.string().optional().describe("所属系列 slug"),
      seriesOrder: z.number().optional().describe("系列中的排序"),
      pinned: z.boolean().default(false).describe("是否置顶"),
      allowComments: z.boolean().default(true).describe("是否允许评论"),
      publishedAt: z.string().optional().describe("定时发布时间 (ISO 8601)"),
    },
    async (params) => {
      const result = await apiRequest("/api/admin/posts", {
        method: "POST",
        body: params,
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 文章已创建：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );

  // ── 更新文章 ──
  server.tool(
    "update_post",
    "更新指定 slug 的文章内容或元信息",
    {
      slug: z.string().describe("要更新的文章 slug"),
      title: z.string().optional().describe("新标题"),
      content: z.string().optional().describe("新的 Markdown 正文"),
      excerpt: z.string().optional().describe("新摘要"),
      coverImage: z.string().optional().describe("新封面图 URL"),
      status: z.enum(["published", "draft", "scheduled"]).optional().describe("新状态"),
      tags: z.array(z.string()).optional().describe("新标签列表"),
      category: z.string().optional().describe("新分类"),
      series: z.string().optional().describe("新系列 slug"),
      seriesOrder: z.number().optional().describe("系列排序"),
      pinned: z.boolean().optional().describe("是否置顶"),
      allowComments: z.boolean().optional().describe("是否允许评论"),
      publishedAt: z.string().optional().describe("定时发布时间"),
    },
    async ({ slug, ...updates }) => {
      const result = await apiRequest(`/api/admin/posts/${encodeURIComponent(slug)}`, {
        method: "PUT",
        body: updates,
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 文章 "${slug}" 已更新：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );

  // ── 删除文章 ──
  server.tool(
    "delete_post",
    "⚠️ 【高危操作】永久删除指定 slug 的文章，此操作不可逆！调用前请务必向主人确认。",
    { 
      slug: z.string().describe("要删除的文章 slug"),
      confirm: z.enum(["yes"]).describe("必须输入 'yes' 确认高危操作")
    },
    async ({ slug, confirm }) => {
      if (confirm !== "yes") {
        return { content: [{ type: "text" as const, text: "❌ 操作已取消：未确认高危操作。" }], isError: true };
      }
      const result = await apiRequest(`/api/admin/posts/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      return {
        content: [{
          type: "text" as const,
          text: `🗑️ 文章 "${slug}" 已被永久删除。${JSON.stringify(result)}`,
        }],
      };
    }
  );

  // ── 批量操作文章 ──
  server.tool(
    "batch_posts",
    "⚠️ 【高危操作】批量修改文章状态（发布/撤回/删除）。单次最多处理 10 篇。",
    {
      slugs: z.array(z.string()).max(10).describe("文章 slug 列表（最多 10 个）"),
      action: z.enum(["publish", "draft", "delete"]).describe("批量动作"),
      confirm: z.enum(["yes"]).describe("如果是 delete 动作，必须输入 'yes' 确认。其他动作可选。")
    },
    async ({ slugs, action, confirm }) => {
      if (action === "delete" && confirm !== "yes") {
        return { content: [{ type: "text" as const, text: "❌ 操作已取消：批量删除必须确认高危操作。" }], isError: true };
      }
      const result = await apiRequest("/api/admin/posts/batch", {
        method: "POST",
        body: { slugs, action },
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 批量 ${action} 完成（${slugs.length} 篇）：${JSON.stringify(result)}`,
        }],
      };
    }
  );

  // ── 文章历史版本 ──
  server.tool(
    "list_post_versions",
    "查看指定文章的历史修改版本列表",
    { slug: z.string().describe("文章 slug") },
    async ({ slug }) => {
      const versions = await apiRequest(`/api/admin/posts/${encodeURIComponent(slug)}/versions`);
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(versions, null, 2),
        }],
      };
    }
  );
}
