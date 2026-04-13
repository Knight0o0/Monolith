/* ──────────────────────────────────────────────
   评论管理工具 (Comments)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

export function registerCommentTools(server: McpServer) {
  // ── 列出所有评论 ──
  server.tool(
    "list_comments",
    "列出博客所有评论（含待审核），返回评论者、内容、审核状态、所属文章等",
    {
      status: z.enum(["all", "pending", "approved"]).default("all").describe("筛选状态"),
    },
    async ({ status }) => {
      const comments = await apiRequest("/api/admin/comments", {
        query: status !== "all" ? { status } : undefined,
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(comments, null, 2),
        }],
      };
    }
  );

  // ── 审批评论 ──
  server.tool(
    "approve_comment",
    "审批通过一条待审核的评论",
    { id: z.number().describe("评论 ID") },
    async ({ id }) => {
      const result = await apiRequest(`/api/admin/comments/${id}/approve`, {
        method: "POST",
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 评论 #${id} 已审批通过。${JSON.stringify(result)}`,
        }],
      };
    }
  );

  // ── 删除评论 ──
  server.tool(
    "delete_comment",
    "⚠️ 【高危操作】永久删除一条评论，此操作不可逆！调用前请确认。",
    { 
      id: z.number().describe("评论 ID"),
      confirm: z.enum(["yes"]).describe("必须输入 'yes' 确认高危操作")
    },
    async ({ id, confirm }) => {
      if (confirm !== "yes") {
        return { content: [{ type: "text" as const, text: "❌ 操作已取消：未确认高危操作。" }], isError: true };
      }
      const result = await apiRequest(`/api/admin/comments/${id}`, {
        method: "DELETE",
      });
      return {
        content: [{
          type: "text" as const,
          text: `🗑️ 评论 #${id} 已删除。${JSON.stringify(result)}`,
        }],
      };
    }
  );
}
