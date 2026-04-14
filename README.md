<div align="center">

<img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/box.svg" width="96" height="96" alt="Monolith" />

# Monolith

**高质感无服务器边缘博客系统**

*极致视觉 · 边缘计算 · 多后端存储 · 零运维成本*

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Hono](https://img.shields.io/badge/Hono-4.x-E36002?style=flat-square&logo=hono&logoColor=white)](https://hono.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br/>

[**📚 文档**](https://github.com/one-ea/Monolith/wiki) · [**🐛 Issue**](https://github.com/one-ea/Monolith/issues) · [**☁️ 在线预览**](https://monolith-client.pages.dev)

</div>

---

## ✨ 项目简介

Monolith 是一套运行在 **Cloudflare 全球边缘网络**上的现代化无服务器博客系统。前后端完全解耦，通过适配器模式支持多种数据库与对象存储后端，无需运维，全球延迟 < 50ms。

> 🎨 **双主题设计语言**：支持**暗色（Slate & Cyan）**与**亮色**双主题，三态切换（暗色 / 亮色 / 跟随系统），玻璃拟态效果，Apple 级 `cubic-bezier` 阻尼动画，为读者和作者提供沉浸式体验。

---

## 🌟 核心特性

| 特性 | 描述 |
|------|------|
| ⚡ **边缘原生** | Hono + Cloudflare Workers，无冷启动，全球毫秒级响应 |
| 🔌 **存储适配器** | 数据库：D1 / Turso / PostgreSQL；对象存储：R2 / S3 兼容 |
| 🌗 **双主题系统** | 暗色 / 亮色 / 跟随系统，CSS 变量驱动零闪烁 |
| 📝 **Markdown** | 代码高亮 + 一键复制、TOC、阅读进度条、预计阅读时间 |
| 🔍 **全站搜索** | ⌘K 快捷触发，标题与内容全文检索 |
| 🔐 **安全设计** | JWT 认证 + 路由守卫 + 管理入口隐藏 |
| 📊 **数据洞察** | 浏览量统计、14 日趋势图、热门排行 |
| 💬 **评论系统** | Honeypot 反垃圾 + 人工审核 |
| 💾 **备份恢复** | JSON / R2-S3 / WebDAV 多端备份 |
| 🗺️ **SEO** | sitemap.xml、RSS 2.0、robots.txt、语义化 HTML |
| 🧩 **代码注入** | 后台注入任意第三方脚本与样式 |
| 🤖 **AI 就绪** | 配备独立的 MCP Server 工具链，赋能 AI 助手全自动打理博客文章与系统配置 |

> 🤖 **MCP 强大赋能**：Monolith 拥有独立的 [Monolith-MCP](https://github.com/one-ea/Monolith-MCP) 工具链（提供 30 种核心工具），您可以直接在 Cursor / Windsurf / Antigravity 等 AI 编辑器中唤醒 AI 为您自动写稿、审核评论、生成数据报表、乃至进行灾备恢复！

---

## 🏗️ 架构

```
┌──────────────────────┐         ┌──────────────────────────┐
│  Cloudflare Pages    │         │   Cloudflare Workers     │
│                      │         │                          │
│  Vite + React SPA    │         │  Hono  ──▶  IDatabase    │
│  Pages Functions     │──API──▶ │           ├── D1         │
│  (反向代理层)         │         │           ├── Turso      │
└──────────────────────┘         │           └── PostgreSQL │
                                 │                          │
                                 │        ──▶  IObjectStorage│
                                 │           ├── R2         │
                                 │           └── S3 兼容    │
                                 └──────────────────────────┘
```

> 详细架构、项目结构与技术选型请参阅 [Wiki · 架构概览](https://github.com/one-ea/Monolith/wiki/Architecture)

---

## 🚀 快速开始

```bash
# 克隆 & 安装
git clone https://github.com/one-ea/Monolith.git && cd Monolith
cd client && npm install && cd ../server && npm install && cd ..

# 配置密钥
cat > server/.dev.vars << 'EOF'
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_random_secret_key
EOF

# 初始化数据库 & 启动
cd server && npx wrangler d1 migrations apply monolith-db --local
npm run dev      # → http://localhost:8787

# 另一终端
cd client && npm run dev      # → http://localhost:5173
```

> 📖 完整指南：[Wiki · 快速开始](https://github.com/one-ea/Monolith/wiki/Quick-Start) ｜ [Wiki · 部署指南](https://github.com/one-ea/Monolith/wiki/Deployment)

---

## 📄 License

[MIT](LICENSE)
