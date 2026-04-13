/* ──────────────────────────────────────────────
   备份恢复工具 (Backup)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

export function registerBackupTools(server: McpServer) {
  // ── 导出 JSON 备份 ──
  server.tool(
    "export_backup",
    "导出博客全部数据为 JSON 格式（文章、评论、设置、页面等）",
    {},
    async () => {
      const backup = await apiRequest("/api/admin/backup/export");
      const text = typeof backup === 'string' ? backup : JSON.stringify(backup, null, 2);
      // 截断过长输出避免 MCP 消息超限
      const truncated = text.length > 50000
        ? text.slice(0, 50000) + "\n\n... [数据已截断，完整备份请通过 backup_to_r2 工具推送到云端]"
        : text;
      return {
        content: [{
          type: "text" as const,
          text: truncated,
        }],
      };
    }
  );

  // ── 备份到 R2 ──
  server.tool(
    "backup_to_r2",
    "将当前博客数据备份到 R2 对象存储（云端安全快照）",
    {},
    async () => {
      const result = await apiRequest("/api/admin/backup/r2", {
        method: "POST",
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 数据已备份到 R2 云端：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );

  // ── 列出 R2 备份 ──
  server.tool(
    "list_r2_backups",
    "列出 R2 存储中所有备份快照（含时间戳和大小）",
    {},
    async () => {
      const backups = await apiRequest("/api/admin/backup/r2-list");
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(backups, null, 2),
        }],
      };
    }
  );

  // ── 从备份恢复 ──
  server.tool(
    "restore_backup",
    "⚠️ 【超高危操作】从 JSON 数据恢复整个博客！会覆盖现有数据！执行前会自动创建 R2 安全快照。调用前请务必向主人二次确认！",
    {
      backupJson: z.string().describe("完整的备份 JSON 字符串"),
    },
    async ({ backupJson }) => {
      // 安全防线：恢复前自动备份
      console.error("[Monolith MCP] 恢复操作前自动创建安全快照...");
      try {
        await apiRequest("/api/admin/backup/r2", { method: "POST" });
        console.error("[Monolith MCP] 安全快照已创建。");
      } catch (e) {
        console.error("[Monolith MCP] 安全快照创建失败", e);
        return {
          content: [{
            type: "text" as const,
            text: "❌ 安全快照创建失败，为防止数据丢失，已终止恢复操作。",
          }],
          isError: true,
        };
      }

      // 执行恢复
      let data: unknown;
      try {
        data = JSON.parse(backupJson);
      } catch {
        return {
          content: [{
            type: "text" as const,
            text: "❌ 备份 JSON 格式无效，请检查后重试。",
          }],
          isError: true,
        };
      }

      const result = await apiRequest("/api/admin/backup/restore", {
        method: "POST",
        body: data,
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 数据恢复完成：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );
}
