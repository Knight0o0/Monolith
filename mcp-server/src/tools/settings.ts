/* ──────────────────────────────────────────────
   站点设置工具 (Settings)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

export function registerSettingsTools(server: McpServer) {
  // ── 获取设置 ──
  server.tool(
    "get_settings",
    "获取博客站点的完整配置（站名、描述、每页文章数、评论审核策略、自定义代码注入等）",
    {},
    async () => {
      const settings = await apiRequest("/api/admin/settings");
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(settings, null, 2),
        }],
      };
    }
  );

  // ── 更新设置 ──
  server.tool(
    "update_settings",
    "更新博客站点配置。只需传入要修改的字段即可，未传入的字段保持不变。",
    {
      site_name: z.string().optional().describe("站点名称"),
      site_description: z.string().optional().describe("站点描述"),
      posts_per_page: z.number().int().min(1).max(100).optional().describe("每页文章数"),
      comments_require_approval: z.boolean().optional().describe("评论是否需要审核"),
      custom_header: z.string().optional().describe("注入到 <head> 中的自定义 HTML/JS"),
      custom_footer: z.string().optional().describe("注入到页面底部的自定义 HTML/JS"),
    },
    async (params) => {
      const result = await apiRequest("/api/admin/settings", {
        method: "PUT",
        body: params,
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 站点设置已更新：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );
}
